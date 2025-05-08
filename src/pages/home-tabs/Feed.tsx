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
import './Feed.css';

interface Post {
  id: string;
  post_content: string;
  post_image: string | null;
  created_at: string;
  user: {
    id: string;
    username: string;
    user_avatar_url: string | null;
  };
}

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const [modalRef, setModalRef] = useState<HTMLIonModalElement | null>(null);

  useEffect(() => {
    if (user) {
      fetchPosts();
    } 
  }, [user]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      // First fetch posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('post_created_at', { ascending: false });

      if (postsError) {
        console.error('Supabase error:', postsError);
        throw postsError;
      }

      if (!postsData) {
        setPosts([]);
        return;
      }

      // Then fetch user data for each post
      const postsWithUsers = await Promise.all(
        postsData.map(async (post) => {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, username, user_avatar_url')
            .eq('id', post.user_id)
            .single();

          if (userError) {
            console.error('Error fetching user data:', userError);
            return null;
          }

          return {
            id: post.post_id,
            post_content: post.post_content,
            post_image: post.post_image,
            created_at: post.post_created_at,
            user: {
              id: userData.id,
              username: userData.username,
              user_avatar_url: userData.user_avatar_url
            }
          };
        })
      );

      // Filter out any null values and set posts
      setPosts(postsWithUsers.filter((post): post is Post => post !== null));
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewPostImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async () => {
    if (!user) {
      setError('You must be logged in to create a post');
      return;
    }

    try {
      setError(null);
      let postImageUrl = null;

      if (newPostImage) {
        const fileExt = newPostImage.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `public/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('user-avatars')
          .upload(filePath, newPostImage, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('user-avatars')
          .getPublicUrl(filePath);

        postImageUrl = publicUrl;
      }

      const { error: insertError } = await supabase
        .from('posts')
        .insert([
          {
            post_content: newPostContent,
            post_image: postImageUrl,
            user_id: user.id
          }
        ]);

      if (insertError) {
        throw insertError;
      }

      setNewPostContent('');
      setNewPostImage(null);
      setImagePreview(null);
      setShowNewPostModal(false);
      fetchPosts();
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post. Please try again.');
    }
  };

  const handleEditPost = async () => {
    if (!user || !selectedPost) return;

    try {
      setError(null);
      let postImageUrl = selectedPost.post_image;

      if (newPostImage) {
        const fileExt = newPostImage.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `public/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('user-avatars')
          .upload(filePath, newPostImage, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('user-avatars')
          .getPublicUrl(filePath);

        postImageUrl = publicUrl;
      }

      const { error: updateError } = await supabase
        .from('posts')
        .update({
          post_content: newPostContent,
          post_image: postImageUrl
        })
        .eq('post_id', selectedPost.id)
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      setNewPostContent('');
      setNewPostImage(null);
      setImagePreview(null);
      setShowEditModal(false);
      setSelectedPost(null);
      fetchPosts();
    } catch (err) {
      console.error('Error updating post:', err);
      setError('Failed to update post. Please try again.');
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

  const openEditModal = (post: Post) => {
    setSelectedPost(post);
    setNewPostContent(post.post_content);
    setImagePreview(post.post_image);
    setShowEditModal(true);
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
        ) : (
          <div className="feed-container">
            {posts.map((post) => (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <div className="user-info">
                    <IonAvatar className="user-avatar">
                      {post.user.user_avatar_url ? (
                        <IonImg src={post.user.user_avatar_url} alt={post.user.username} />
                      ) : (
                        <IonIcon icon={personOutline} />
                      )}
                    </IonAvatar>
                    <div className="user-details">
                      <p className="username">{post.user.username}</p>
                      <p className="post-time">{formatDate(post.created_at)}</p>
                    </div>
                  </div>
                  {user && post.user.id === user.id && (
                    <IonButton
                      fill="clear"
                      onClick={() => {
                        setSelectedPost(post);
                        setShowActionSheet(true);
                      }}
                    >
                      <IonIcon icon={ellipsisVertical} />
                    </IonButton>
                  )}
                </div>
                <div className="post-content">
                  <p>{post.post_content}</p>
                  {post.post_image && (
                    <IonImg
                      src={post.post_image}
                      alt="Post image"
                      className="post-image"
                    />
                  )}
                </div>
                <div className="post-actions">
                  <div className="action-buttons-group">
                    <IonButton
                      fill="clear"
                      className={`action-button ${likedPosts.has(post.id) ? 'liked' : ''}`}
                      onClick={() => toggleLike(post.id)}
                    >
                      <IonIcon
                        icon={likedPosts.has(post.id) ? heart : heartOutline}
                        color={likedPosts.has(post.id) ? 'danger' : 'medium'}
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
            ))}
          </div>
        )}

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton 
            className="new-post-button" 
            onClick={() => {
              setNewPostContent('');
              setNewPostImage(null);
              setImagePreview(null);
              setShowNewPostModal(true);
            }}
          >
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        {/* New Post Modal */}
        <IonModal
          isOpen={showNewPostModal}
          onDidDismiss={() => {
            setShowNewPostModal(false);
            setNewPostContent('');
            setNewPostImage(null);
            setImagePreview(null);
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
                  setNewPostImage(null);
                  setImagePreview(null);
                }}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="modal-content">
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
                />
                <label htmlFor="post-image-upload" className="image-upload-label">
                  <IonIcon icon={imageOutline} />
                  Add Image
                </label>
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                    <IonButton
                      fill="clear"
                      className="remove-image-button"
                      onClick={() => {
                        setImagePreview(null);
                        setNewPostImage(null);
                      }}
                    >
                      <IonIcon icon={close} />
                    </IonButton>
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
                    setNewPostImage(null);
                    setImagePreview(null);
                  }}
                >
                  Cancel
                </IonButton>
                <IonButton
                  className="submit-button"
                  onClick={handleCreatePost}
                  disabled={!newPostContent.trim() && !newPostImage}
                >
                  Post
                </IonButton>
              </div>
            </div>
          </IonContent>
        </IonModal>

        {/* Edit Post Modal */}
        <IonModal
          isOpen={showEditModal}
          onDidDismiss={() => {
            setShowEditModal(false);
            setNewPostContent('');
            setNewPostImage(null);
            setImagePreview(null);
          }}
          onDidPresent={() => {
            // Focus the textarea when modal opens
            const textarea = document.querySelector('.post-textarea') as HTMLIonTextareaElement;
            if (textarea) {
              setTimeout(() => textarea.setFocus(), 100);
            }
          }}
          className="post-modal"
          breakpoints={[0, 1]}
          initialBreakpoint={1}
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>Edit Post</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => {
                  setShowEditModal(false);
                  setNewPostContent('');
                  setNewPostImage(null);
                  setImagePreview(null);
                }}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="modal-content">
            <IonTextarea
              value={newPostContent}
              onIonChange={e => setNewPostContent(e.detail.value!)}
              placeholder="What's on your mind?"
              rows={4}
              className="post-textarea"
            />
            <div className="image-upload-container">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
                id="edit-post-image-upload"
              />
              <label htmlFor="edit-post-image-upload" className="image-upload-label">
                <IonIcon icon={imageOutline} />
                Change Image
              </label>
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <IonButton
                    fill="clear"
                    className="remove-image-button"
                    onClick={() => {
                      setImagePreview(null);
                      setNewPostImage(null);
                    }}
                  >
                    <IonIcon icon={close} />
                  </IonButton>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <IonButton
                fill="clear"
                className="cancel-button"
                onClick={() => {
                  setShowEditModal(false);
                  setNewPostContent('');
                  setNewPostImage(null);
                  setImagePreview(null);
                }}
              >
                Cancel
              </IonButton>
              <IonButton
                className="submit-button"
                onClick={handleEditPost}
                disabled={!newPostContent.trim()}
              >
                Update Post
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

        {/* Action Sheet */}
        <IonActionSheet
          isOpen={showActionSheet}
          onDidDismiss={() => setShowActionSheet(false)}
          buttons={[
            {
              text: 'Edit',
              icon: createOutline,
              handler: () => {
                if (selectedPost) {
                  openEditModal(selectedPost);
                }
              }
            },
            {
              text: 'Delete',
              icon: trashOutline,
              cssClass: 'action-sheet-button delete',
              handler: () => {
                if (selectedPost) {
                  handleDeletePost(selectedPost.id);
                }
              }
            },
            {
              text: 'Cancel',
              role: 'cancel'
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Feed;
