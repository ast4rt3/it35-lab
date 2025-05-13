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
  shareOutline
} from 'ionicons/icons';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { useHistory } from 'react-router-dom';
import './Feed.css';

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
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImages, setNewPostImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [username, setUsername] = useState<string | null>(null);
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

      setPosts(postsData as Post[]);
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

  const toggleLike = (postId: string) => {
    setLikedPosts(prev => {
      const newLikedPosts = new Set(prev);
      if (newLikedPosts.has(postId)) {
        newLikedPosts.delete(postId);
      } else {
        newLikedPosts.add(postId);
      }
      return newLikedPosts;
    });
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
                        className={`action-button ${likedPosts.has(post.post_id) ? 'liked' : ''}`}
                        onClick={() => toggleLike(post.post_id)}
                      >
                        <IonIcon
                          icon={likedPosts.has(post.post_id) ? heart : heartOutline}
                          color={likedPosts.has(post.post_id) ? 'danger' : 'medium'}
                        />
                        Like
                      </IonButton>
                      <IonButton fill="clear" className="action-button">
                        <IonIcon icon={chatbubbleOutline} />
                        Comment
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
      </IonContent>
    </IonPage>
  );
};

export default Feed;
