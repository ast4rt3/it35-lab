import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonText,
  IonButton,
  IonIcon,
  IonModal,
  IonTextarea,
  IonImg,
  IonSpinner,
  IonAlert,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonFab,
  IonFabButton,
  IonActionSheet,
} from '@ionic/react';
import { 
  imageOutline,
  closeOutline,
  personOutline,
  close,
  add,
  createOutline,
  trashOutline,
  ellipsisVertical,
  heartOutline,
  heart,
  chatbubbleOutline,
  shareOutline,
  peopleOutline,
  sendOutline,
  arrowUndoOutline
} from 'ionicons/icons';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { useHistory } from 'react-router-dom';
import './Feed.css';

interface LikedUser {
  user_id: string;
  username: string;
  user_avatar_url?: string | null;
}

interface Comment {
  id: string;
  user_id: string;
  username: string;
  user_avatar_url: string | null;
  parent_comment_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  replies?: Comment[];
}

interface Post {
  post_id: string;
  user_id: string;
  username: string;
  post_content: string;
  post_created_at: string;
  post_updated_at: string;
  image_urls?: string[];
  users?: {
    username: string;
    user_avatar_url: string | null;
  };
  like_count: number;
  comment_count: number;
  liked_by_user: boolean;
  liked_by?: LikedUser[];
  likes?: Array<{
    user_id: string;
  }>;
  comments?: Comment[];
}

interface PostData {
  post_content: string;
  user_id: string;
  username: string;
  post_created_at: string;
  post_updated_at: string;
  image_urls?: string[];
}

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [showEditPostModal, setShowEditPostModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editPostContent, setEditPostContent] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImages, setNewPostImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [showLikedByModal, setShowLikedByModal] = useState(false);
  const [selectedPostLikes, setSelectedPostLikes] = useState<LikedUser[]>([]);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedPostComments, setSelectedPostComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const { user } = useAuth();
  const history = useHistory();

  // Listen for auth state changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setPosts([]);
        setUsername(null);
        history.push('/it35-lab');
      } else if (event === 'SIGNED_IN' && session?.user) {
        fetchUser();
        fetchPosts();
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [history]);

  // Initial data fetch
  useEffect(() => {
    if (user) {
      fetchUser();
      fetchPosts();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUser = async () => {
    if (!user?.email) return;
    
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('username')
        .eq('email', user.email)
        .single();

      if (userError) {
        console.error('Error fetching user:', userError);
        return;
      }

      if (userData) {
        setUsername(userData.username);
      }
    } catch (err) {
      console.error('Error in fetchUser:', err);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          users:user_id (
            username,
            user_avatar_url
          ),
          likes:likes (
            user_id
          )
        `)
        .order('post_created_at', { ascending: false });

      if (postsError) {
        console.error('Supabase error:', postsError);
        throw postsError;
      }

      if (!postsData) {
        setPosts([]);
        return;
      }

      // Process posts to include like and comment information
      const processedPosts = await Promise.all(postsData.map(async (post) => {
        const { data: likeCount } = await supabase
          .rpc('get_post_like_count', { post_id: post.post_id });

        const { data: commentCount } = await supabase
          .rpc('get_post_comment_count', { post_id: post.post_id });

        const { data: likedBy } = await supabase
          .rpc('get_post_liked_users', { post_id: post.post_id });

        const isLikedByUser = post.likes?.some((like: { user_id: string }) => like.user_id === user?.id);

        return {
          ...post,
          like_count: likeCount || 0,
          comment_count: commentCount || 0,
          liked_by_user: isLikedByUser || false,
          liked_by: likedBy || []
        };
      }));

      setPosts(processedPosts as Post[]);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setNewPostImages(prev => [...prev, ...files]);
      
      // Create previews for new images
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setNewPostImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = async () => {
    if (!user || !username) {
      setError('You must be logged in to create a post');
      return;
    }

    try {
      setError(null);
      const imageUrls: string[] = [];

      // Upload all images if they exist
      for (const image of newPostImages) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(filePath, image);

        if (uploadError) {
          console.error('Image upload error:', uploadError);
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(filePath);

        imageUrls.push(publicUrl);
      }

      const now = new Date().toISOString();
      const postData: PostData = {
        post_content: newPostContent,
        user_id: user.id,
        username: username,
        post_created_at: now,
        post_updated_at: now
      };

      if (imageUrls.length > 0) {
        postData.image_urls = imageUrls;
      }

      console.log('Attempting to insert post with data:', postData);

      const { data: newPost, error: insertError } = await supabase
        .from('posts')
        .insert([postData])
        .select()
        .single();

      if (insertError) {
        console.error('Insert error details:', insertError);
        throw insertError;
      }

      if (newPost) {
        setPosts(prevPosts => [newPost as Post, ...prevPosts]);
      }

      setNewPostContent('');
      setNewPostImages([]);
      setImagePreviews([]);
      setShowNewPostModal(false);
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post. Please try again.');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      fetchPosts();
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Failed to delete post. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleLike = async (postId: string) => {
    if (!user) return;

    try {
      const post = posts.find(p => p.post_id === postId);
      if (!post) return;

      if (post.liked_by_user) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .match({ post_id: postId, user_id: user.id });

        if (error) throw error;

        setPosts(prevPosts => prevPosts.map(p => {
          if (p.post_id === postId) {
            return {
              ...p,
              like_count: (p.like_count || 0) - 1,
              liked_by_user: false,
              liked_by: p.liked_by?.filter(l => l.user_id !== user.id) || []
            };
          }
          return p;
        }));
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert([{ post_id: postId, user_id: user.id }]);

        if (error) throw error;

        // Fetch updated like information
        const { data: likedBy } = await supabase
          .rpc('get_post_liked_users', { post_id: postId });

        setPosts(prevPosts => prevPosts.map(p => {
          if (p.post_id === postId) {
            return {
              ...p,
              like_count: (p.like_count || 0) + 1,
              liked_by_user: true,
              liked_by: likedBy || []
            };
          }
          return p;
        }));
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      setError('Failed to update like. Please try again.');
    }
  };

  const showLikedBy = async (postId: string) => {
    try {
      const { data: likedBy } = await supabase
        .rpc('get_post_liked_users', { post_id: postId });

      // Fetch user avatars for each user who liked the post
      const likedByWithAvatars = await Promise.all(
        (likedBy || []).map(async (user: LikedUser) => {
          const { data: userData } = await supabase
            .from('users')
            .select('user_avatar_url')
            .eq('id', user.user_id)
            .single();
          
          return {
            ...user,
            user_avatar_url: userData?.user_avatar_url
          };
        })
      );

      setSelectedPostLikes(likedByWithAvatars);
      setShowLikedByModal(true);
    } catch (err) {
      console.error('Error fetching liked by:', err);
      setError('Failed to load liked by information.');
    }
  };

  const handleModalDismiss = () => {
    setShowNewPostModal(false);
    setNewPostContent('');
    setNewPostImages([]);
    setImagePreviews([]);
  };

  const handleModalPresent = () => {
    // Focus the textarea after a short delay to ensure modal is fully rendered
    setTimeout(() => {
      const textarea = document.querySelector('.post-textarea') as HTMLIonTextareaElement;
      if (textarea) {
        textarea.setFocus();
      }
    }, 100);
  };

  const fetchComments = async (postId: string) => {
    try {
      const { data: comments, error } = await supabase
        .rpc('get_post_comments', { post_id: postId });

      if (error) throw error;

      // Organize comments into a threaded structure
      const commentMap = new Map<string, Comment>();
      const rootComments: Comment[] = [];

      // First pass: create map of all comments
      comments.forEach((comment: Comment) => {
        commentMap.set(comment.id, { ...comment, replies: [] });
      });

      // Second pass: organize into threaded structure
      comments.forEach((comment: Comment) => {
        const commentWithReplies = commentMap.get(comment.id)!;
        if (comment.parent_comment_id) {
          const parentComment = commentMap.get(comment.parent_comment_id);
          if (parentComment) {
            parentComment.replies = parentComment.replies || [];
            parentComment.replies.push(commentWithReplies);
          }
        } else {
          rootComments.push(commentWithReplies);
        }
      });

      setSelectedPostComments(rootComments);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments. Please try again.');
    }
  };

  const handleShowComments = async (postId: string) => {
    setSelectedPostId(postId);
    setShowCommentsModal(true);
    await fetchComments(postId);
  };

  const handleAddComment = async () => {
    if (!user || !selectedPostId || !newComment.trim()) return;

    try {
      const commentData = {
        post_id: selectedPostId,
        user_id: user.id,
        content: newComment.trim(),
        parent_comment_id: replyingTo?.id || null
      };

      const { error } = await supabase
        .from('comments')
        .insert([commentData]);

      if (error) throw error;

      // Refresh comments
      await fetchComments(selectedPostId);

      // Update post comment count
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.post_id === selectedPostId) {
          return {
            ...post,
            comment_count: (post.comment_count || 0) + 1
          };
        }
        return post;
      }));

      // Reset form
      setNewComment('');
      setReplyingTo(null);
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment. Please try again.');
    }
  };

  const handleReply = (comment: Comment) => {
    setReplyingTo(comment);
    // Focus the comment input
    setTimeout(() => {
      const textarea = document.querySelector('.comment-textarea') as HTMLIonTextareaElement;
      if (textarea) {
        textarea.setFocus();
      }
    }, 100);
  };

  const renderComment = (comment: Comment, depth: number = 0) => (
    <div key={comment.id} className="comment" style={{ marginLeft: `${depth * 20}px` }}>
      <div className="comment-header">
        <IonAvatar className="comment-avatar">
          {comment.user_avatar_url ? (
            <img src={comment.user_avatar_url} alt={`${comment.username}'s avatar`} />
          ) : (
            <IonIcon icon={personOutline} />
          )}
        </IonAvatar>
        <div className="comment-info">
          <span className="comment-username">{comment.username}</span>
          <span className="comment-time">{formatDate(comment.created_at)}</span>
        </div>
      </div>
      <div className="comment-content">
        <p>{comment.content}</p>
      </div>
      <div className="comment-actions">
        <IonButton
          fill="clear"
          size="small"
          onClick={() => handleReply(comment)}
        >
          <IonIcon icon={arrowUndoOutline} slot="start" />
          Reply
        </IonButton>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div className="comment-replies">
          {comment.replies.map(reply => renderComment(reply, depth + 1))}
        </div>
      )}
    </div>
  );

  const handleEditPost = async () => {
    if (!user || !editingPost || !editPostContent.trim()) return;

    try {
      const { error } = await supabase
        .from('posts')
        .update({
          post_content: editPostContent.trim(),
          post_updated_at: new Date().toISOString()
        })
        .eq('post_id', editingPost.post_id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update the post in the local state
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.post_id === editingPost.post_id) {
          return {
            ...post,
            post_content: editPostContent.trim(),
            post_updated_at: new Date().toISOString()
          };
        }
        return post;
      }));

      setShowEditPostModal(false);
      setEditingPost(null);
      setEditPostContent('');
    } catch (err) {
      console.error('Error editing post:', err);
      setError('Failed to edit post. Please try again.');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Feed</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>Loading posts...</p>
          </div>
        ) : !user ? (
          <div className="not-logged-in-message">
            <p>Please log in to view posts</p>
          </div>
        ) : (
          <div className="feed-container">
            {posts.length === 0 ? (
              <div className="no-posts-message">
                <p>No posts yet. Be the first to post!</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.post_id} className="post-card">
                  <div className="post-header">
                    <div className="user-info">
                      <IonAvatar className="user-avatar">
                        {post.users?.user_avatar_url ? (
                          <img src={post.users.user_avatar_url} alt="User avatar" />
                        ) : (
                          <IonIcon icon={personOutline} />
                        )}
                      </IonAvatar>
                      <div className="user-details">
                        <p className="username">{post.users?.username || 'Unknown User'}</p>
                        <p className="post-time">{formatDate(post.post_created_at)}</p>
                      </div>
                    </div>
                    {user && post.user_id === user.id && (
                      <IonButton
                        fill="clear"
                        onClick={() => {
                          setShowActionSheet(true);
                          setSelectedPost(post);
                        }}
                      >
                        <IonIcon icon={ellipsisVertical} />
                      </IonButton>
                    )}
                  </div>
                  <div className="post-content">
                    <p>{post.post_content}</p>
                    {post.image_urls && post.image_urls.length > 0 && (
                      <div className="post-images-grid">
                        {post.image_urls.map((url, index) => (
                          <div key={index} className="post-image-container">
                            <img src={url} className="post-image" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="post-actions">
                    <div className="action-buttons-group">
                      <IonButton
                        fill="clear"
                        className={`action-button ${post.liked_by_user ? 'liked' : ''}`}
                        onClick={() => toggleLike(post.post_id)}
                      >
                        <IonIcon
                          icon={post.liked_by_user ? heart : heartOutline}
                          color={post.liked_by_user ? 'danger' : 'medium'}
                        />
                        {post.like_count ?? 0}
                      </IonButton>
                      {(post.like_count ?? 0) > 0 && (
                        <IonButton
                          fill="clear"
                          className="action-button"
                          onClick={() => showLikedBy(post.post_id)}
                        >
                          <IonIcon icon={peopleOutline} />
                          Liked by
                        </IonButton>
                      )}
                      <IonButton
                        fill="clear"
                        className="action-button"
                        onClick={() => handleShowComments(post.post_id)}
                      >
                        <IonIcon icon={chatbubbleOutline} />
                        {post.comment_count}
                      </IonButton>
                      <IonButton fill="clear" className="action-button">
                        <IonIcon icon={shareOutline} />
                        Share
                      </IonButton>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton 
            className="new-post-button" 
            onClick={() => {
              setShowNewPostModal(true);
              setNewPostContent('');
              setNewPostImages([]);
              setImagePreviews([]);
            }}
          >
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        {/* Post Options Action Sheet */}
        <IonActionSheet
          isOpen={showActionSheet && selectedPost !== null}
          onDidDismiss={() => {
            setShowActionSheet(false);
            setSelectedPost(null);
          }}
          buttons={[
            {
              text: 'Edit',
              icon: createOutline,
              cssClass: 'action-sheet-button edit',
              handler: () => {
                if (selectedPost) {
                  setEditingPost(selectedPost);
                  setEditPostContent(selectedPost.post_content);
                  setShowEditPostModal(true);
                }
              }
            },
            {
              text: 'Delete',
              icon: trashOutline,
              cssClass: 'action-sheet-button delete',
              handler: () => {
                if (selectedPost) {
                  handleDeletePost(selectedPost.post_id);
                }
              }
            },
            {
              text: 'Cancel',
              role: 'cancel'
            }
          ]}
        />

        {/* New Post Modal */}
        <IonModal
          isOpen={showNewPostModal}
          onDidDismiss={() => {
            setShowNewPostModal(false);
            setNewPostContent('');
            setNewPostImages([]);
            setImagePreviews([]);
          }}
          className="post-modal"
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>Create Post</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => {
                  setShowNewPostModal(false);
                  setNewPostContent('');
                  setNewPostImages([]);
                  setImagePreviews([]);
                }}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div className="post-form">
              <IonTextarea
                value={newPostContent}
                onIonChange={e => setNewPostContent(e.detail.value!)}
                placeholder="What's on your mind?"
                rows={4}
                className="post-textarea"
                autoGrow={true}
              />
              <div className="image-upload-container">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                  id="post-image-upload"
                  multiple
                />
                <label htmlFor="post-image-upload" className="image-upload-label">
                  <IonIcon icon={imageOutline} />
                  Add Images
                </label>
                {imagePreviews.length > 0 && (
                  <div className="image-previews-grid">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="image-preview">
                        <img src={preview} alt={`Preview ${index + 1}`} />
                        <IonButton
                          fill="clear"
                          className="remove-image-button"
                          onClick={() => removeImage(index)}
                        >
                          <IonIcon icon={close} />
                        </IonButton>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-actions">
                <IonButton
                  fill="clear"
                  className="cancel-button"
                  onClick={() => {
                    setShowNewPostModal(false);
                    setNewPostContent('');
                    setNewPostImages([]);
                    setImagePreviews([]);
                  }}
                >
                  Cancel
                </IonButton>
                <IonButton
                  className="submit-button"
                  onClick={handleCreatePost}
                  disabled={!newPostContent.trim() && newPostImages.length === 0}
                >
                  Post
                </IonButton>
              </div>
            </div>
          </IonContent>
        </IonModal>

        {/* Liked By Modal */}
        <IonModal
          isOpen={showLikedByModal}
          onDidDismiss={() => setShowLikedByModal(false)}
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>Liked By</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowLikedByModal(false)}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList>
              {selectedPostLikes.map((like) => (
                <IonItem key={like.user_id} lines="full">
                  <IonAvatar slot="start" className="liked-by-avatar">
                    {like.user_avatar_url ? (
                      <img src={like.user_avatar_url} alt={`${like.username}'s avatar`} />
                    ) : (
                      <IonIcon icon={personOutline} />
                    )}
                  </IonAvatar>
                  <IonLabel>
                    <h2>{like.username}</h2>
                  </IonLabel>
                </IonItem>
              ))}
            </IonList>
          </IonContent>
        </IonModal>

        {/* Comments Modal */}
        <IonModal
          isOpen={showCommentsModal}
          onDidDismiss={() => {
            setShowCommentsModal(false);
            setSelectedPostId(null);
            setSelectedPostComments([]);
            setNewComment('');
            setReplyingTo(null);
          }}
          className="comments-modal"
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>Comments</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowCommentsModal(false)}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="comments-content">
            <div className="comments-container">
              {selectedPostComments.map(comment => renderComment(comment))}
            </div>
            <div className="comment-input-container">
              {replyingTo && (
                <div className="replying-to">
                  Replying to <strong>{replyingTo.username}</strong>
                  <IonButton
                    fill="clear"
                    size="small"
                    onClick={() => setReplyingTo(null)}
                  >
                    <IonIcon icon={closeOutline} />
                  </IonButton>
                </div>
              )}
              <div className="comment-input">
                <IonTextarea
                  value={newComment}
                  onIonChange={e => setNewComment(e.detail.value!)}
                  placeholder={replyingTo ? `Reply to ${replyingTo.username}...` : "Add a comment..."}
                  rows={1}
                  autoGrow={true}
                  className="comment-textarea"
                />
                <IonButton
                  fill="clear"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  <IonIcon icon={sendOutline} />
                </IonButton>
              </div>
            </div>
          </IonContent>
        </IonModal>

        {/* Edit Post Modal */}
        <IonModal
          isOpen={showEditPostModal}
          onDidDismiss={() => {
            setShowEditPostModal(false);
            setEditingPost(null);
            setEditPostContent('');
          }}
          className="post-modal"
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>Edit Post</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => {
                  setShowEditPostModal(false);
                  setEditingPost(null);
                  setEditPostContent('');
                }}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div className="post-form">
              <IonTextarea
                value={editPostContent}
                onIonChange={e => setEditPostContent(e.detail.value!)}
                placeholder="What's on your mind?"
                rows={4}
                className="post-textarea"
                autoGrow={true}
              />
              <div className="modal-actions">
                <IonButton
                  fill="clear"
                  className="cancel-button"
                  onClick={() => {
                    setShowEditPostModal(false);
                    setEditingPost(null);
                    setEditPostContent('');
                  }}
                >
                  Cancel
                </IonButton>
                <IonButton
                  className="submit-button"
                  onClick={handleEditPost}
                  disabled={!editPostContent.trim()}
                >
                  Save Changes
                </IonButton>
              </div>
            </div>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Feed;
