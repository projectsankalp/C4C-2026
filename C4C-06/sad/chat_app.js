/**
 * chat_app.js
 * 
 * Handles the UI interactions and DOM updates for the Reddit-style Community Chat.
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const feedContainer = document.getElementById('communityFeed');
    const feedPostsWrapper = document.getElementById('feedPostsWrapper');
    const inboxView = document.getElementById('inboxView');
    
    const topicSearchInput = document.getElementById('topicSearchInput');
    const userSearchInput = document.getElementById('userSearchInput');
    
    const navGlobalFeed = document.getElementById('navGlobalFeed');
    const navMessages = document.getElementById('navMessages');
    const navExplore = document.getElementById('navExplore');
    
    const exploreSearchBox = document.getElementById('exploreSearchBox');
    const exploreList = document.getElementById('exploreList');
    
    const threadSidebar = document.getElementById('threadSidebar');
    const centerViewTitle = document.getElementById('centerViewTitle');
    
    const chatbox = document.getElementById('chatbox');
    const sendBtn = document.getElementById('sendBtn');
    
    // New Feed UI Elements
    const feedPostInput = document.getElementById('feedPostInput');
    const feedPhotoBtn = document.getElementById('feedPhotoBtn');
    const feedMicBtn = document.getElementById('feedMicBtn');
    const feedPhotoUpload = document.getElementById('feedPhotoUpload');
    const feedPreviewContainer = document.getElementById('feedPreviewContainer');
    const feedSubmitBtn = document.getElementById('feedSubmitBtn');
    
    let currentUploadDataUrl = null;
    let currentAudioDataUrl = null;
    let mediaRecorder = null;
    let audioChunks = [];
    
    const notifBell = document.getElementById('notifBell');
    const notifBadge = document.getElementById('notifBadge');
    const notifDropdown = document.getElementById('notifDropdown');
    const notifList = document.getElementById('notifList');
    
    // Auth Check
    const currentUser = window.chatService.getCurrentUser();
    if (!currentUser) {
        alert("Please login first to access the community chat.");
        window.location.href = 'auth.html';
        return;
    }

    // Set user header
    const chatHeader = document.querySelector('.chat-sidebar .chat-header span');
    if (chatHeader) {
        chatHeader.textContent = currentUser.nickname;
    }

    // --- VIEW TOGGLING ---
    function setActiveNav(btn) {
        [navGlobalFeed, navMessages, navExplore].forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }

    navGlobalFeed.addEventListener('click', () => {
        setActiveNav(navGlobalFeed);
        centerViewTitle.textContent = "Global Feed";
        feedContainer.style.display = 'flex';
        inboxView.style.display = 'none';
        exploreSearchBox.style.display = 'none';
        exploreList.style.display = 'none';
        closeThread();
    });

    navMessages.addEventListener('click', () => {
        setActiveNav(navMessages);
        centerViewTitle.textContent = "Messages";
        feedContainer.style.display = 'none';
        inboxView.style.display = 'flex';
        exploreSearchBox.style.display = 'none';
        exploreList.style.display = 'none';
        renderInboxList();
        closeThread();
    });

    navExplore.addEventListener('click', () => {
        setActiveNav(navExplore);
        exploreSearchBox.style.display = 'block';
        exploreList.style.display = 'block';
        renderExploreUsers(window.chatService.getAllUsers());
    });


    // --- COMMUNITY FEED (Global Feed) ---
    let currentTopicFilter = '';

    function renderPosts(posts) {
        if (!feedPostsWrapper) return;
        feedPostsWrapper.innerHTML = '';
        
        const filteredPosts = currentTopicFilter 
            ? posts.filter(p => p.content.toLowerCase().includes(currentTopicFilter.toLowerCase()))
            : posts;

        if (filteredPosts.length === 0) {
            feedPostsWrapper.innerHTML = '<div style="text-align:center; padding: 40px; opacity:0.5;">No posts found.</div>';
            return;
        }

        // Render newest first
        [...filteredPosts].reverse().forEach(post => {
            const timeStr = new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            let audioHtml = '';
            if (post.audioUrl) {
                audioHtml = `<audio controls src="${post.audioUrl}" style="display:block; margin-top:8px; height: 32px; width: 100%; border-radius:16px;"></audio>`;
            }
            let imageHtml = '';
            if (post.imageUrl) {
                imageHtml = `<img src="${post.imageUrl}" style="display:block; margin-top:8px; max-width: 100%; border-radius:12px; max-height:300px; object-fit:cover;">`;
            }

            const card = document.createElement('div');
            card.className = 'message-card';
            card.innerHTML = `
                <div class="msg-avatar" style="background:var(--accent-primary); display:flex; align-items:center; justify-content:center; color:white; font-weight:bold;">
                    ${post.userId.charAt(0).toUpperCase()}
                </div>
                <div class="msg-content" style="overflow:hidden;">
                    <div class="msg-header">
                        <span class="msg-author">${post.userId}</span>
                        <span class="msg-time">${timeStr}</span>
                    </div>
                    <div class="msg-body">
                        ${post.content || ''}
                        ${imageHtml}
                        ${audioHtml}
                    </div>
                    <div class="msg-actions">
                        <button class="msg-action-btn" onclick="likePost('${post.id}')"><span class="material-symbols-outlined">favorite</span> ${post.likes}</button>
                        <button class="msg-action-btn" onclick="openReplyThread('${post.id}')"><span class="material-symbols-outlined">reply</span> Reply (${post.replies.length})</button>
                    </div>
                </div>
            `;
            feedPostsWrapper.appendChild(card);
        });
    }

    // Initial Render Feed
    renderPosts(window.chatService.getCommunityPosts());

    window.chatService.onCommunityUpdate = (newPosts) => {
        renderPosts(newPosts);
        updateNotifications(); // Replies might have triggered notif
    };

    // Topic Search Logic
    topicSearchInput.addEventListener('input', (e) => {
        currentTopicFilter = e.target.value.trim();
        // Switch to Global Feed automatically when searching topics
        navGlobalFeed.click();
        renderPosts(window.chatService.getCommunityPosts());
    });

    // Post to community via new inline UI
    if (feedSubmitBtn && feedPostInput) {
        
        function clearFeedInput() {
            feedPostInput.value = '';
            currentUploadDataUrl = null;
            currentAudioDataUrl = null;
            feedPreviewContainer.style.display = 'none';
            feedPreviewContainer.innerHTML = '';
        }

        // Handle Image Select
        feedPhotoBtn.addEventListener('click', () => feedPhotoUpload.click());
        feedPhotoUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    currentUploadDataUrl = ev.target.result;
                    currentAudioDataUrl = null; // Clear audio if img selected
                    feedPreviewContainer.style.display = 'block';
                    feedPreviewContainer.innerHTML = `<img src="${currentUploadDataUrl}" style="max-height:100px; border-radius:8px;"> <span style="font-size:12px; opacity:0.6; cursor:pointer;" onclick="clearFeedInput()">ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â  Clear</span>`;
                };
                reader.readAsDataURL(file);
            }
        });

        // Handle Mic Record
        feedMicBtn.addEventListener('click', async () => {
            if (mediaRecorder && mediaRecorder.state === "recording") {
                mediaRecorder.stop();
                feedMicBtn.classList.remove('active');
                return;
            }

            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                audioChunks = [];

                mediaRecorder.ondataavailable = e => {
                    if (e.data.size > 0) audioChunks.push(e.data);
                };

                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        currentAudioDataUrl = ev.target.result;
                        currentUploadDataUrl = null; // Clear img if audio recorded
                        feedPreviewContainer.style.display = 'block';
                        feedPreviewContainer.innerHTML = `<audio controls src="${currentAudioDataUrl}" style="height:30px;"></audio> <span style="font-size:12px; opacity:0.6; cursor:pointer;" onclick="clearFeedInput()">ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â  Clear</span>`;
                    };
                    reader.readAsDataURL(audioBlob);
                    
                    stream.getTracks().forEach(track => track.stop());
                };

                mediaRecorder.start();
                feedMicBtn.classList.add('active');
                feedPreviewContainer.style.display = 'block';
                feedPreviewContainer.innerHTML = `<span style="color:#ff4757; font-size:13px; font-weight:bold;">ÃƒÆ’Ã‚Â¢Ãƒâ€šÃ¢â‚¬â€œÃƒâ€šÃ‚Â¶ Recording... Click Mic again to stop.</span>`;
            } catch (err) {
                alert("Microphone access denied or unavailable.");
                console.error(err);
            }
        });

        feedSubmitBtn.addEventListener('click', () => {
            const text = feedPostInput.value.trim();
            if (text || currentUploadDataUrl || currentAudioDataUrl) {
                window.chatService.addCommunityPost(text, currentAudioDataUrl, currentUploadDataUrl);
                clearFeedInput();
                navGlobalFeed.click(); 
                renderPosts(window.chatService.getCommunityPosts());
            }
        });

        feedPostInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                feedSubmitBtn.click();
            }
        });
        
        // Expose global for the clear button injected in HTML string
        window.clearFeedInput = clearFeedInput;
    }

    window.likePost = (postId) => {
        window.chatService.likePost(postId);
        renderPosts(window.chatService.getCommunityPosts());
    };


    // --- THREAD REPLIES ---
    window.openReplyThread = (postId) => {
        threadSidebar.classList.add('open');
        const post = window.chatService.getCommunityPosts().find(p => p.id === postId);
        if(!post) return;
        
        threadSidebar.innerHTML = `
            <div class="chat-header">
                <span>Thread</span>
                <span class="material-symbols-outlined" style="cursor: pointer;" onclick="closeThread()">close</span>
            </div>
            <div class="thread-messages" id="threadMsgs">
               <div class="bubble received" style="background:var(--accent-primary); color:white; border-bottom-left-radius:20px; border-bottom-right-radius:4px; max-width:90%;">
                 <strong>${post.userId}:</strong><br>
                 ${post.content}
               </div>
               ${post.replies.map(r => `
                  <div class="bubble ${r.userId === currentUser.nickname ? 'sent' : 'received'}">
                    <span style="font-size:10px; opacity:0.6; display:block; margin-bottom:2px;">${r.userId}</span>
                    ${r.content}
                  </div>
               `).join('')}
            </div>
            <div class="thread-input">
                <input type="text" id="replyInput" placeholder="Reply to thread...">
                <button class="thread-send-btn" onclick="submitReply('${post.id}')"><span class="material-symbols-outlined">send</span></button>
            </div>
        `;
        const msgs = document.getElementById('threadMsgs');
        if(msgs) msgs.scrollTop = msgs.scrollHeight;
    };

    window.submitReply = (postId) => {
        const input = document.getElementById('replyInput');
        if (input && input.value.trim()) {
            window.chatService.addReplyToPost(postId, input.value.trim());
            window.openReplyThread(postId);
            renderPosts(window.chatService.getCommunityPosts());
        }
    };

    window.closeThread = () => {
        threadSidebar.classList.remove('open');
    };


    // --- MESSAGES / INBOX VIEW ---
    function renderInboxList() {
        inboxView.innerHTML = '';
        const allDms = window.chatService.getDirectMessages();
        
        // Find unique users we've chatted with
        const chatPartners = new Set();
        allDms.forEach(m => {
            if(m.senderId === currentUser.nickname) chatPartners.add(m.receiverId);
            if(m.receiverId === currentUser.nickname) chatPartners.add(m.senderId);
        });

        if(chatPartners.size === 0) {
            inboxView.innerHTML = '<div style="text-align:center; padding: 40px; opacity:0.5;">No personal messages yet. Go Explore Users to start a chat!</div>';
            return;
        }

        chatPartners.forEach(partner => {
            const msgs = window.chatService.getMessagesWithUser(partner);
            const lastMsg = msgs[msgs.length - 1];
            
            // Unread count
            const unread = msgs.filter(m => m.receiverId === currentUser.nickname && !m.isRead).length;
            
            const card = document.createElement('div');
            card.className = 'message-card';
            card.style.cursor = 'pointer';
            card.onclick = () => window.openDMSession(partner);
            card.innerHTML = `
                <div class="msg-avatar" style="background:var(--accent-warm); color:#333; display:flex; align-items:center; justify-content:center; font-weight:bold;">
                    ${partner.charAt(0).toUpperCase()}
                </div>
                <div class="msg-content">
                    <div class="msg-header" style="justify-content: space-between;">
                        <span class="msg-author">${partner}</span>
                        ${unread > 0 ? `<span class="notif-badge" style="position:relative; top:0; right:0;">${unread}</span>` : ''}
                    </div>
                    <div class="msg-body" style="font-size:13px; opacity:0.7;">
                        ${lastMsg.senderId === currentUser.nickname ? 'You: ' : ''}${lastMsg.content}
                    </div>
                </div>
            `;
            inboxView.appendChild(card);
        });
    }

    // --- EXPLORE USERS ---
    function renderExploreUsers(users) {
        exploreList.innerHTML = '';
        users.forEach(u => {
            if (u.nickname === currentUser.nickname) return;
            const item = document.createElement('div');
            item.className = 'user-item';
            item.innerHTML = `
                <div class="user-avatar" style="background:var(--accent-soft); color:white;">
                    ${u.nickname.charAt(0).toUpperCase()}
                </div>
                <div class="user-info">
                    <div class="user-name">${u.nickname}</div>
                    <div class="user-status">Tap to Message</div>
                </div>
            `;
            item.onclick = () => {
                navMessages.click();
                window.openDMSession(u.nickname);
            };
            exploreList.appendChild(item);
        });
    }

    userSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        renderExploreUsers(window.chatService.searchUsers(query));
    });


    // --- DIRECT MESSAGING ---
    window.openDMSession = (otherUserId) => {
        threadSidebar.classList.add('open');
        
        // Mark as read immediately
        const dms = window.chatService.getDirectMessages();
        let changed = false;
        dms.forEach(m => {
            if(m.receiverId === currentUser.nickname && m.senderId === otherUserId && !m.isRead) {
                m.isRead = true;
                changed = true;
            }
        });
        if(changed) {
            localStorage.setItem('mindcircle_direct_messages', JSON.stringify(dms));
            updateNotifications();
            if(inboxView.style.display !== 'none') renderInboxList();
        }
        
        renderDMs(otherUserId);
    };

    function renderDMs(otherUserId) {
        threadSidebar.dataset.activeDmUser = otherUserId;
        const messages = window.chatService.getMessagesWithUser(otherUserId);
        
        threadSidebar.innerHTML = `
            <div class="chat-header">
                <span>${otherUserId}</span>
                <span class="material-symbols-outlined" style="cursor: pointer;" onclick="closeThread()">close</span>
            </div>
            <div class="thread-messages" id="dmMsgs">
               ${messages.length === 0 ? '<div style="opacity:0.5; text-align:center;">Say hi!</div>' : ''}
               ${messages.map(m => `
                  <div class="bubble ${m.senderId === currentUser.nickname ? 'sent' : 'received'}">
                    ${m.content}
                  </div>
               `).join('')}
            </div>
            <div class="thread-input">
                <input type="text" id="dmInput" placeholder="Message ${otherUserId}...">
                <button class="thread-send-btn" onclick="submitDM('${otherUserId}')"><span class="material-symbols-outlined">send</span></button>
            </div>
        `;
        const msgs = document.getElementById('dmMsgs');
        if(msgs) msgs.scrollTop = msgs.scrollHeight;
        
        const dmInput = document.getElementById('dmInput');
        if (dmInput) {
            dmInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') window.submitDM(otherUserId);
            });
        }
    }

    window.submitDM = (otherUserId) => {
        const input = document.getElementById('dmInput');
        if (input && input.value.trim()) {
            window.chatService.sendDirectMessage(otherUserId, input.value.trim());
            renderDMs(otherUserId);
            if(inboxView.style.display !== 'none') renderInboxList();
        }
    };

    window.chatService.onDirectMessageUpdate = () => {
        updateNotifications();
        if(inboxView.style.display !== 'none') renderInboxList();
        
        const currentActiveUser = threadSidebar.dataset.activeDmUser;
        if (threadSidebar.classList.contains('open') && currentActiveUser) {
            // Auto mark read if we are looking at it
            const dms = window.chatService.getDirectMessages();
            let changed = false;
            dms.forEach(m => {
                if(m.receiverId === currentUser.nickname && m.senderId === currentActiveUser && !m.isRead) {
                    m.isRead = true;
                    changed = true;
                }
            });
            if(changed) localStorage.setItem('mindcircle_direct_messages', JSON.stringify(dms));
            
            renderDMs(currentActiveUser);
        }
    };


    // --- NOTIFICATIONS LOGIC ---
    function updateNotifications() {
        const allDms = window.chatService.getDirectMessages();
        const unreadDMs = allDms.filter(m => m.receiverId === currentUser.nickname && !m.isRead);
        
        const count = unreadDMs.length;
        
        if (count > 0) {
            notifBadge.style.display = 'block';
            notifBadge.textContent = count > 9 ? '9+' : count;
        } else {
            notifBadge.style.display = 'none';
        }
        
        // Build dropdown content
        notifList.innerHTML = '';
        if (count === 0) {
            notifList.innerHTML = '<div style="padding:15px; text-align:center; opacity:0.5; font-size:12px;">No new messages</div>';
        } else {
            // Group by sender
            const senders = new Set(unreadDMs.map(m => m.senderId));
            senders.forEach(sender => {
                const numMsgs = unreadDMs.filter(m => m.senderId === sender).length;
                const item = document.createElement('div');
                item.className = 'notif-item';
                item.innerHTML = `<strong>${sender}</strong> sent you ${numMsgs} message${numMsgs > 1 ? 's' : ''}`;
                item.onclick = () => {
                    notifDropdown.style.display = 'none';
                    navMessages.click();
                    window.openDMSession(sender);
                };
                notifList.appendChild(item);
            });
        }
    }

    // Toggle dropdown
    notifBell.addEventListener('click', (e) => {
        e.stopPropagation();
        notifDropdown.style.display = notifDropdown.style.display === 'none' ? 'block' : 'none';
    });
    
    // Close dropdown on click outside
    document.addEventListener('click', () => {
        if (notifDropdown.style.display === 'block') {
            notifDropdown.style.display = 'none';
        }
    });
    notifDropdown.addEventListener('click', e => e.stopPropagation());

    // Initial check
    updateNotifications();

});
