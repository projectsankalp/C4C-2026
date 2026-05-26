from flask import Flask, request, jsonify, send_file
import os
import sys
import threading
import time
import asyncio
import edge_tts
import tempfile
from dotenv import load_dotenv

# Environment Initialization
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(BASE_DIR, ".env")
load_dotenv(ENV_PATH)

print(f"[BOOT] Neural Environment loaded from {ENV_PATH}")

# RAG Neural Link Initialization
RAG_PATH = os.path.dirname(os.path.abspath(__file__))
if RAG_PATH not in sys.path:
    sys.path.append(RAG_PATH)

def log_boot(msg):
    print(msg)
    with open(os.path.join(BASE_DIR, "rag_server_boot.log"), "a", encoding="utf-8") as f:
        f.write(f"{time.ctime()} - {msg}\n")

log_boot("[BOOT] Initializing RAG Neural Link...")

generate_answer = None
pick_and_read_files = None
insert_document = None

def auto_ingest_pdf_folder():
    time.sleep(2)  # Allow a short delay for startup bindings
    pdf_dir = os.path.join(RAG_PATH, "pdf")
    if not os.path.exists(pdf_dir):
        os.makedirs(pdf_dir, exist_ok=True)
        print(f"[AUTO-INGEST] Created auto-upload folder at: {pdf_dir}")
        return
    
    files = [os.path.join(pdf_dir, f) for f in os.listdir(pdf_dir) if os.path.isfile(os.path.join(pdf_dir, f))]
    if not files:
        print("[AUTO-INGEST] No files found in 'pdf/' folder for auto-upload.")
        return
        
    print(f"[AUTO-INGEST] Found {len(files)} files in 'pdf/' for automatic ingestion. Processing...")
    
    target_dir = os.path.join(RAG_PATH, "users", "user_global", "mental_health")
    os.makedirs(target_dir, exist_ok=True)
    namespace = "user_global_mental_health"
    
    success_count = 0
    for path in files:
        try:
            base_name = os.path.splitext(os.path.basename(path))[0]
            print(f"[AUTO-INGEST] Indexing: {base_name}...")
            
            text = universal_reader.read_file(path)
            if text:
                dest_txt_path = os.path.join(target_dir, f"{base_name}.txt")
                with open(dest_txt_path, "w", encoding="utf-8") as f:
                    f.write(text)
                    
                insert_document(base_name, text, namespace)
                success_count += 1
                
                if os.path.exists(path):
                    os.remove(path)
                print(f"[AUTO-INGEST] Successfully indexed and purged: {base_name}")
        except Exception as e:
            print(f"[AUTO-INGEST] Error processing auto-upload file {path}: {e}")
            
    print(f"[AUTO-INGEST] Complete! Successfully auto-uploaded {success_count} out of {len(files)} files.")

try:
    log_boot("[BOOT] Linking logic modules...")
    import rag_answer
    import universal_reader
    import insert_pinecone
    
    generate_answer = rag_answer.generate_answer
    pick_and_read_files = universal_reader.pick_and_read_files
    insert_document = insert_pinecone.insert_document
    log_boot("[SUCCESS] RAG Neural Core synchronized and online.")
    
    # Trigger auto-ingestion on successful boot
    threading.Thread(target=auto_ingest_pdf_folder, daemon=True).start()
except Exception as e:
    import traceback
    err = f"[CRITICAL] RAG Neural Core failure: {e}\n{traceback.format_exc()}"
    log_boot(err)

app = Flask(__name__)

@app.after_request
def add_cors_headers(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

@app.route('/')
def index():
    try:
        with open(os.path.join(BASE_DIR, "index.html"), "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        return f"Error loading index.html: {str(e)}", 500

@app.route('/health', methods=['GET'])
def health():
    status = "online" if generate_answer else "offline"
    return jsonify({
        "status": status,
        "modules": {
            "rag_answer": generate_answer is not None,
            "reader": pick_and_read_files is not None,
            "inserter": insert_document is not None
        }
    })

@app.route('/ask', methods=['POST'])
def ask():
    if not generate_answer:
        return jsonify({"answer": "RAG Neural Core is offline."})
    
    data = request.json
    prompt = data.get('prompt')
    namespace = data.get('namespace')
    history = data.get('history', [])
    
    # Extract folder from namespace for history persistence
    try:
        folder = namespace.split('_')[-1]
        # Assuming folder structure: users/user_X/folderName/chat_history.txt
        user_id_part = namespace.split('_')[1]
        history_file = os.path.join(RAG_PATH, "users", f"user_{user_id_part}", folder, "chat_history.txt")
    except:
        history_file = None

    try:
        print(f"[RAG-SERVER] Processing query for namespace: {namespace}")
        answer = generate_answer(prompt, namespace, history)
        
        if history_file:
            try:
                os.makedirs(os.path.dirname(history_file), exist_ok=True)
                with open(history_file, "a", encoding="utf-8") as f:
                    f.write(f"USER: {prompt}\nAI: {answer}\n---\n")
            except: pass
            
        return jsonify({"answer": answer})
    except Exception as e:
        return jsonify({"answer": f"Execution Error: {str(e)}"})

@app.route('/tts', methods=['POST'])
def tts_endpoint():
    try:
        data = request.json or {}
        text = data.get('text', '')
        voice = data.get('voice', 'en-US-ChristopherNeural')
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
            
        # Clean HTML/Markdown tags that edge-tts shouldn't pronounce
        import re
        clean_text = re.sub(r'<[^>]*>', '', text)
        clean_text = re.sub(r'[\*\_~`#]', '', clean_text)
            
        async def generate_tts(t, v):
            comm = edge_tts.Communicate(t, v)
            # Create a temporary file that is not auto-deleted on close on Windows
            temp_fd, temp_path = tempfile.mkstemp(suffix=".mp3")
            os.close(temp_fd)
            await comm.save(temp_path)
            return temp_path
            
        # Run the async edge_tts generator synchronously in Flask
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        output_file = loop.run_until_complete(generate_tts(clean_text, voice))
        loop.close()
        
        return send_file(output_file, mimetype="audio/mpeg", as_attachment=False)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

upload_status = {
    "status": "idle",
    "message": "",
    "processed_files": 0,
    "total_files": 0
}

@app.route('/upload/status', methods=['GET'])
def upload_status_api():
    return jsonify(upload_status)

@app.route('/upload', methods=['POST'])
def upload():
    if not pick_and_read_files:
        return jsonify({"success": False, "message": "Neural uplink offline."})
    
    data = request.json
    user_id = data.get('user_id')
    folder = data.get('folder')
    is_media = data.get('media', False)
    namespace = f"user_{user_id}_{folder}"
    
    target_dir = os.path.join(RAG_PATH, "users", f"user_{user_id}", folder)
    os.makedirs(target_dir, exist_ok=True)

    upload_status["status"] = "selecting"
    upload_status["message"] = "Selecting files..."
    upload_status["processed_files"] = 0
    upload_status["total_files"] = 0

    def run_upload():
        try:
            results = pick_and_read_files(media_only=is_media)
            if results:
                upload_status["status"] = "ingesting"
                upload_status["total_files"] = len(results)
                upload_status["processed_files"] = 0
                
                for path, text in results:
                    try:
                        base_name = os.path.splitext(os.path.basename(path))[0]
                        upload_status["message"] = f"Ingesting: {base_name} ({upload_status['processed_files'] + 1}/{len(results)})"
                        
                        dest_txt_path = os.path.join(target_dir, f"{base_name}.txt")
                        
                        try:
                            with open(dest_txt_path, "w", encoding="utf-8") as f:
                                f.write(text)
                            if os.path.exists(path):
                                os.remove(path)
                        except Exception as e:
                            print(f"[RAG-SERVER] File conversion/purge error: {e}")

                        # Process with Pinecone
                        insert_document(base_name, text, namespace)
                        upload_status["processed_files"] += 1
                    except Exception as doc_err:
                        print(f"[RAG-SERVER] Failed to process document {path}: {doc_err}")
                
                upload_status["status"] = "completed"
                upload_status["message"] = f"Successfully ingested {upload_status['processed_files']} out of {len(results)} files!"
            else:
                upload_status["status"] = "idle"
                upload_status["message"] = "No files were selected."
        except Exception as e:
            upload_status["status"] = "error"
            upload_status["message"] = f"Upload failed: {str(e)}"

    threading.Thread(target=run_upload).start()
    return jsonify({"success": True, "message": "Neural selection initiated"})

@app.route('/emotion', methods=['POST'])
def run_emotion_scan():
    import emotion
    data = request.json or {}
    user_id = data.get('user_id', '1')
    folder = data.get('folder', 'mental_health')
    namespace = f"user_{user_id}_{folder}"
    
    try:
        # Run facial mesh scanning for 4 seconds (try GUI window, fallback to headless on thread failures)
        try:
            state, score, msg = emotion.get_user_emotion(max_runtime=4, show_window=True)
        except Exception as gui_err:
            print(f"[RAG-SERVER] OpenCV GUI window failed or blocked ({gui_err}). Falling back to headless web camera core...")
            state, score, msg = emotion.get_user_emotion(max_runtime=4, show_window=False)
        
        # Map fatigue/wellness score to 7 distinct emotional stages
        if score <= 5:
            stage = "Zen / Peaceful"
            answer = "Love the smile! What's bringing you joy today?"

        elif score <= 10:
            stage = "Happy / Positive"
            answer ="Feeling peaceful today? You look incredibly calm."

        elif score <= 20:
            stage = "Balanced / Neutral"
            answer = "You look steady and balanced. How's it going?"
        elif score <= 30:
            stage = "Slightly Tired / Distracted"
            answer = "A bit tired or distracted? What's on your mind?"
        elif score <= 50:
            stage = "Stressed / Anxious"
            answer = "Notice some stress on your face. Are you okay?"
        elif score <= 60:
            stage = "Fatigued / Exhausted"
            answer = "You look exhausted. Have you had time to rest?"
        else:
            stage = "Severe Burnout / Crisis Alert"
            answer = "Highly fatigued or burnt out. Breathe, I'm here for you."

        return jsonify({
            "success": True,
            "state": state,
            "score": score,
            "stage": stage,
            "message": msg,
            "answer": answer
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

if __name__ == "__main__":
    app.run(port=5050, debug=True, use_reloader=False)
