$scriptBlock = @"
  <script>
  document.addEventListener("DOMContentLoaded", () => {
    const previewContainer = document.getElementById('previewContainer');
    if (!previewContainer) return;

    // Handle File Upload Previews
    const fileUpload = document.getElementById("fileUpload");
    if (fileUpload) {
      fileUpload.addEventListener("change", (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        
        Array.from(files).forEach(file => {
          const item = document.createElement('div');
          item.className = 'preview-item';
          
          const removeBtn = document.createElement('div');
          removeBtn.className = 'remove-btn';
          removeBtn.innerHTML = '&times;';
          removeBtn.onclick = () => item.remove();
          
          if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            item.appendChild(img);
          } else {
            const icon = document.createElement('span');
            icon.className = 'material-symbols-outlined';
            icon.textContent = 'description';
            item.appendChild(icon);
          }
          
          item.appendChild(removeBtn);
          previewContainer.appendChild(item);
        });
      });
    }

    // Handle AI Generate Image
    const popupMenu = document.getElementById('popupMenu');
    const aiGenBtn = Array.from(document.querySelectorAll('.popup-menu li')).find(li => li.textContent.includes('AI Generate Image'));
    
    if (aiGenBtn) {
      aiGenBtn.addEventListener('click', () => {
        // Clear previous UI if any
        const existingUI = previewContainer.querySelector('.ai-gen-ui');
        if (existingUI) existingUI.remove();

        const ui = document.createElement('div');
        ui.className = 'ai-gen-ui';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Describe the image you want...';
        
        const controls = document.createElement('div');
        controls.className = 'ai-gen-controls';
        
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:14px;">close</span> Cancel';
        closeBtn.style.background = 'rgba(255, 71, 87, 0.9)';
        closeBtn.onclick = () => ui.remove();

        const genBtn = document.createElement('button');
        genBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:14px;">auto_awesome</span> Generate';
        genBtn.onclick = () => {
          if (!input.value.trim()) return;
          genBtn.innerHTML = 'Generating...';
          genBtn.disabled = true;
          
          // Show preview item after generation mock delay
          setTimeout(() => {
            ui.remove();
            const item = document.createElement('div');
            item.className = 'preview-item';
            const img = document.createElement('img');
            img.src = 'https://images.unsplash.com/photo-1698047976856-d7c71ba76e3c?auto=format&fit=crop&w=150&q=80';
            
            const removeBtn = document.createElement('div');
            removeBtn.className = 'remove-btn';
            removeBtn.innerHTML = '&times;';
            removeBtn.onclick = () => item.remove();
            
            item.appendChild(img);
            item.appendChild(removeBtn);
            previewContainer.appendChild(item);
          }, 1500);
        };

        controls.appendChild(closeBtn);
        controls.appendChild(genBtn);
        ui.appendChild(input);
        ui.appendChild(controls);
        
        previewContainer.appendChild(ui);
        
        // Focus the input
        setTimeout(() => input.focus(), 100);
        
        // Close menu
        if (popupMenu) popupMenu.style.display = 'none';
      });
    }
  });
  </script>
</body>
"@

Get-ChildItem -Filter *.html | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    
    # Check if already injected
    if ($content -notmatch 'id="previewContainer"') {
        # Inject HTML
        $content = $content -replace '<textarea class="chatbox"', "<div id=`"previewContainer`" class=`"preview-container`"></div>`n    <textarea class=`"chatbox`""
        
        # Inject JS
        $content = $content -replace '</body>', $scriptBlock
        
        Set-Content $_.FullName $content -Encoding UTF8
        Write-Host "Injected $($_.Name)"
    }
}
