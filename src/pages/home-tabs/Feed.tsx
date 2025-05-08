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
  IonFab,
  IonFabButton,
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
} from '@ionic/react';
import { 
  add, 
  heartOutline,
  heart,
  chatbubbleOutline,
  shareOutline,
  imageOutline,
  closeOutline,
  personOutline,
  close
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
    avatar_url: string | null;
  };
}

interface PostWithUser {
  id: string;
  post_content: string;
  post_image: string | null;
  created_at: string;
  users: {
    id: string;
    user_firstname: string;
    user_lastname: string;
  };
}

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  const ensureUserExists = async () => {
    if (!user) return;

    try {
      // Check if user exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code === 'PGRST116') {
        // User doesn't exist, create them
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: user.id,
              username: user.email?.split('@')[0] || 'user',
              user_firstname: '',
              user_lastname: '',
              user_avatar_url: null
            }
          ]);

        if (insertError) {
          console.error('Error creating user:', insertError);
          throw insertError;
        }
      } else if (fetchError) {
        console.error('Error checking user:', fetchError);
        throw fetchError;
      }
    } catch (err) {
      console.error('Error in ensureUserExists:', err);
      throw err;
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Ensure user exists before fetching posts
      await ensureUserExists();

      // First check if posts table exists
      const { error: tableCheckError } = await supabase
        .from('posts')
        .select('post_id')
        .limit(1);

      if (tableCheckError) {
        console.error('Error checking posts table:', tableCheckError);
        throw tableCheckError;
      }

      // Fetch the posts
      const { data, error } = await supabase
        .from('posts')
        .select(`
          post_id,
          post_content,
          avatar_url,
          post_created_at,
          user_id,
          username
        `)
        .order('post_created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (!data) {
        setPosts([]);
        return;
      }

      // Transform the data to match our Post interface
      const transformedPosts: Post[] = data.map((post: any) => ({
        id: post.post_id,
        post_content: post.post_content,
        post_image: post.avatar_url,
        created_at: post.post_created_at,
        user: {
          id: post.user_id,
          username: post.username,
          avatar_url: post.avatar_url
        }
      }));

      setPosts(transformedPosts);
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
      // Ensure user exists before creating post
      await ensureUserExists();

      let imageUrl = null;

      if (newPostImage) {
        const fileExt = newPostImage.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `post-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(filePath, newPostImage);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('post-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const { error: insertError } = await supabase
        .from('posts')
        .insert([
          {
            user_id: user.id,
            post_content: newPostContent,
            avatar_url: imageUrl,
            username: user.email?.split('@')[0] || 'user'
          },
        ]);

      if (insertError) {
        console.error('Insert error:', insertError);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot='start'>
              <IonMenuButton />
            </IonButtons>
            <IonTitle>Feed</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>Loading posts...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot='start'>
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Feed</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {error && (
          <IonAlert
            isOpen={!!error}
            onDidDismiss={() => setError(null)}
            header="Error"
            message={error}
            buttons={['OK']}
          />
        )}

        <IonList>
          {posts.map((post) => (
            <IonCard key={post.id}>
              <IonCardHeader>
                <IonCardSubtitle>
                  {post.user.username}
                </IonCardSubtitle>
                <IonCardTitle>{formatDate(post.created_at)}</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonText>{post.post_content}</IonText>
                {post.post_image && (
                  <IonImg
                    src={post.post_image}
                    alt="Post image"
                    className="post-image"
                  />
                )}
              </IonCardContent>
            </IonCard>
          ))}
        </IonList>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => setShowNewPostModal(true)}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        <IonModal isOpen={showNewPostModal} onDidDismiss={() => setShowNewPostModal(false)}>
          <IonContent className="ion-padding">
            <div className="modal-header">
              <h2>Create New Post</h2>
              <IonButton fill="clear" onClick={() => setShowNewPostModal(false)}>
                <IonIcon icon={close} />
              </IonButton>
            </div>

            <IonTextarea
              value={newPostContent}
              onIonChange={(e) => setNewPostContent(e.detail.value!)}
              placeholder="What's on your mind?"
              rows={4}
              className="post-textarea"
            />

            <div className="image-preview-container">
              {imagePreview && (
                <div className="image-preview">
                  <IonImg src={imagePreview} alt="Preview" />
                  <IonButton
                    fill="clear"
                    onClick={() => {
                      setNewPostImage(null);
                      setImagePreview(null);
                    }}
                  >
                    <IonIcon icon={close} />
                  </IonButton>
                </div>
              )}
            </div>

            <div className="post-actions">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
                id="image-upload"
              />
              <label htmlFor="image-upload">
                <IonButton fill="clear">
                  <IonIcon icon={imageOutline} />
                  Add Image
                </IonButton>
              </label>

              <IonButton
                expand="block"
                onClick={handleCreatePost}
                disabled={!newPostContent.trim()}
              >
                Post
              </IonButton>
            </div>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Feed;
