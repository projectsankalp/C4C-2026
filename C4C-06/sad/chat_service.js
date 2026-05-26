/**
 * chat_service.js
 * 
 * Simulates a real-time backend using localStorage and the 'storage' event.
 * Provides functions for Community Posts and Direct Messaging.
 */

const STORAGE_KEYS = {
    COMMUNITY_POSTS: 'mindcircle_community_posts',
    DIRECT_MESSAGES: 'mindcircle_direct_messages',
    USERS: 'mentalHealth_users',
    CURRENT_USER: 'mentalHealth_currentUser'
  };
  
  // Initialize storage if empty
  if (!localStorage.getItem(STORAGE_KEYS.COMMUNITY_POSTS)) {
    localStorage.setItem(STORAGE_KEYS.COMMUNITY_POSTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.DIRECT_MESSAGES)) {
    localStorage.setItem(STORAGE_KEYS.DIRECT_MESSAGES, JSON.stringify([]));
  }
  
  class ChatService {
    constructor() {
      this.currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
      this.onCommunityUpdate = null;
      this.onDirectMessageUpdate = null;
  
      // Listen for cross-tab changes to simulate real-time
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEYS.COMMUNITY_POSTS && this.onCommunityUpdate) {
          this.onCommunityUpdate(this.getCommunityPosts());
        }
        if (e.key === STORAGE_KEYS.DIRECT_MESSAGES && this.onDirectMessageUpdate) {
          this.onDirectMessageUpdate(this.getDirectMessages());
        }
      });
    }
  
    // ---- Users ----
    getCurrentUser() {
      return this.currentUser;
    }
  
    getAllUsers() {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    }
  
    searchUsers(query) {
      const users = this.getAllUsers();
      if (!query) return users;
      return users.filter(u => u.nickname.toLowerCase().includes(query.toLowerCase()));
    }
  
    // ---- Community Feed ----
    getCommunityPosts() {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMUNITY_POSTS) || '[]');
    }
  
    addCommunityPost(content, audioUrl = null, imageUrl = null) {
      if (!this.currentUser) return null;
      const posts = this.getCommunityPosts();
      const newPost = {
        id: 'post_' + Date.now(),
        userId: this.currentUser.nickname,
        avatar: this.currentUser.profilePic || '',
        content: content,
        audioUrl: audioUrl,
        imageUrl: imageUrl,
        timestamp: new Date().toISOString(),
        likes: 0,
        replies: []
      };
      posts.push(newPost);
      localStorage.setItem(STORAGE_KEYS.COMMUNITY_POSTS, JSON.stringify(posts));
      
      // Trigger local update manually for the current tab
      if (this.onCommunityUpdate) this.onCommunityUpdate(posts);
      return newPost;
    }
  
    addReplyToPost(postId, content) {
        if (!this.currentUser) return null;
        const posts = this.getCommunityPosts();
        const post = posts.find(p => p.id === postId);
        if (!post) return;
        
        post.replies.push({
            id: 'reply_' + Date.now(),
            userId: this.currentUser.nickname,
            content: content,
            timestamp: new Date().toISOString()
        });
        
        localStorage.setItem(STORAGE_KEYS.COMMUNITY_POSTS, JSON.stringify(posts));
        if (this.onCommunityUpdate) this.onCommunityUpdate(posts);
    }
  
    likePost(postId) {
      const posts = this.getCommunityPosts();
      const post = posts.find(p => p.id === postId);
      if (post) {
        post.likes += 1;
        localStorage.setItem(STORAGE_KEYS.COMMUNITY_POSTS, JSON.stringify(posts));
        if (this.onCommunityUpdate) this.onCommunityUpdate(posts);
      }
    }
  
    // ---- Direct Messages ----
    getDirectMessages() {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.DIRECT_MESSAGES) || '[]');
    }
  
    getMessagesWithUser(otherUserId) {
      if (!this.currentUser) return [];
      const dms = this.getDirectMessages();
      return dms.filter(m => 
        (m.senderId === this.currentUser.nickname && m.receiverId === otherUserId) ||
        (m.senderId === otherUserId && m.receiverId === this.currentUser.nickname)
      );
    }
  
    sendDirectMessage(receiverId, content) {
      if (!this.currentUser) return null;
      const dms = this.getDirectMessages();
      const newMsg = {
        id: 'dm_' + Date.now(),
        senderId: this.currentUser.nickname,
        receiverId: receiverId,
        content: content,
        timestamp: new Date().toISOString(),
        isRead: false
      };
      dms.push(newMsg);
      localStorage.setItem(STORAGE_KEYS.DIRECT_MESSAGES, JSON.stringify(dms));
      
      if (this.onDirectMessageUpdate) this.onDirectMessageUpdate(dms);
      return newMsg;
    }
  }
  
  // Create global instance
  window.chatService = new ChatService();
  
