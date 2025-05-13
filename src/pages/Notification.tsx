import { 
    IonButtons,
    IonContent, 
    IonHeader, 
    IonMenuButton, 
    IonPage, 
    IonTitle, 
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonAvatar,
    IonIcon,
    IonText,
    IonSpinner,
    IonModal,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle
} from '@ionic/react';
import { 
    heartOutline, 
    chatbubbleOutline, 
    personOutline,
    timeOutline,
    closeOutline,
    heart,
    chatbubbleOutline as chatbubbleOutlineFilled,
    peopleOutline
} from 'ionicons/icons';
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

interface Notification {
    id: string;
    type: 'like' | 'comment' | 'reply';
    post_id: string;
    post_content: string;
    user_id: string;
    username: string;
    user_avatar_url: string | null;
    created_at: string;
    read: boolean;
}

interface Post {
    post_id: string;
    post_content: string;
    user_id: string;
    username: string;
    user_avatar_url: string | null;
    post_created_at: string;
    post_updated_at: string;
    image_urls?: string[];
    like_count: number;
    comment_count: number;
    liked_by_user: boolean;
}

interface User {
    id: string;
    username: string;
    user_avatar_url: string | null;
}

interface LikeData {
    id: string;
    post_id: string;
    user_id: string;
    created_at: string;
    posts: Post;
}

interface CommentData {
    id: string;
    post_id: string;
    user_id: string;
    content: string;
    created_at: string;
    posts: Post;
}

interface ReplyData {
    id: string;
    post_id: string;
    user_id: string;
    content: string;
    created_at: string;
    parent_comment_id: string;
    posts: Post;
}

interface LikedUser {
    user_id: string;
    username: string;
    user_avatar_url: string | null;
}

interface Comment {
    id: string;
    post_id: string;
    user_id: string;
    content: string;
    created_at: string;
    parent_comment_id: string | null;
    username: string;
    user_avatar_url: string | null;
    replies?: Comment[];
}

const Notification: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFullViewModal, setShowFullViewModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [selectedPostComments, setSelectedPostComments] = useState<Comment[]>([]);
    const [selectedPostLikes, setSelectedPostLikes] = useState<LikedUser[]>([]);
    const [showLikedByModal, setShowLikedByModal] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            
            // Fetch likes on user's posts
            const { data: likesData, error: likesError } = await supabase
                .from('likes')
                .select(`
                    id,
                    post_id,
                    user_id,
                    created_at,
                    posts!inner (
                        post_content,
                        user_id
                    )
                `)
                .eq('posts.user_id', user?.id)
                .neq('user_id', user?.id)
                .order('created_at', { ascending: false }) as { data: LikeData[] | null, error: any };

            if (likesError) throw likesError;

            // Get user information for likes
            const likeUserIds = likesData?.map(like => like.user_id) || [];
            const { data: likeUsers, error: likeUsersError } = await supabase
                .from('users')
                .select('id, username, user_avatar_url')
                .in('id', likeUserIds);

            if (likeUsersError) throw likeUsersError;

            // Fetch comments on user's posts
            const { data: commentsData, error: commentsError } = await supabase
                .from('comments')
                .select(`
                    id,
                    post_id,
                    user_id,
                    content,
                    created_at,
                    posts!inner (
                        post_content,
                        user_id
                    )
                `)
                .eq('posts.user_id', user?.id)
                .neq('user_id', user?.id)
                .order('created_at', { ascending: false }) as { data: CommentData[] | null, error: any };

            if (commentsError) throw commentsError;

            // Get user information for comments
            const commentUserIds = commentsData?.map(comment => comment.user_id) || [];
            const { data: commentUsers, error: commentUsersError } = await supabase
                .from('users')
                .select('id, username, user_avatar_url')
                .in('id', commentUserIds);

            if (commentUsersError) throw commentUsersError;

            // Fetch replies to user's comments
            const { data: repliesData, error: repliesError } = await supabase
                .from('comments')
                .select(`
                    id,
                    post_id,
                    user_id,
                    content,
                    created_at,
                    parent_comment_id,
                    posts!inner (
                        post_content
                    )
                `)
                .eq('parent_comment_id', user?.id)
                .order('created_at', { ascending: false }) as { data: ReplyData[] | null, error: any };

            if (repliesError) throw repliesError;

            // Get user information for replies
            const replyUserIds = repliesData?.map(reply => reply.user_id) || [];
            const { data: replyUsers, error: replyUsersError } = await supabase
                .from('users')
                .select('id, username, user_avatar_url')
                .in('id', replyUserIds);

            if (replyUsersError) throw replyUsersError;

            // Create user lookup maps
            const likeUserMap = new Map(likeUsers?.map(user => [user.id, user]) || []);
            const commentUserMap = new Map(commentUsers?.map(user => [user.id, user]) || []);
            const replyUserMap = new Map(replyUsers?.map(user => [user.id, user]) || []);

            // Combine and format all notifications
            const formattedNotifications: Notification[] = [
                ...(likesData?.map(like => {
                    const likeUser = likeUserMap.get(like.user_id);
                    return {
                        id: like.id,
                        type: 'like' as const,
                        post_id: like.post_id,
                        post_content: like.posts.post_content,
                        user_id: like.user_id,
                        username: likeUser?.username || 'Unknown User',
                        user_avatar_url: likeUser?.user_avatar_url || null,
                        created_at: like.created_at,
                        read: false
                    };
                }) || []),
                ...(commentsData?.map(comment => {
                    const commentUser = commentUserMap.get(comment.user_id);
                    return {
                        id: comment.id,
                        type: 'comment' as const,
                        post_id: comment.post_id,
                        post_content: comment.posts.post_content,
                        user_id: comment.user_id,
                        username: commentUser?.username || 'Unknown User',
                        user_avatar_url: commentUser?.user_avatar_url || null,
                        created_at: comment.created_at,
                        read: false
                    };
                }) || []),
                ...(repliesData?.map(reply => {
                    const replyUser = replyUserMap.get(reply.user_id);
                    return {
                        id: reply.id,
                        type: 'reply' as const,
                        post_id: reply.post_id,
                        post_content: reply.posts.post_content,
                        user_id: reply.user_id,
                        username: replyUser?.username || 'Unknown User',
                        user_avatar_url: replyUser?.user_avatar_url || null,
                        created_at: reply.created_at,
                        read: false
                    };
                }) || [])
            ];

            // Sort notifications by date
            formattedNotifications.sort((a, b) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            setNotifications(formattedNotifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'like':
                return heartOutline;
            case 'comment':
            case 'reply':
                return chatbubbleOutline;
            default:
                return personOutline;
        }
    };

    const getNotificationText = (notification: Notification) => {
        switch (notification.type) {
            case 'like':
                return 'liked your post';
            case 'comment':
                return 'commented on your post';
            case 'reply':
                return 'replied to your comment';
            default:
                return 'interacted with your post';
        }
    };

    const toggleLike = async (postId: string) => {
        if (!user) return;

        try {
            const { data: existingLike, error: checkError } = await supabase
                .from('likes')
                .select('*')
                .eq('post_id', postId)
                .eq('user_id', user.id)
                .single();

            if (checkError && checkError.code !== 'PGRST116') {
                throw checkError;
            }

            if (existingLike) {
                // Unlike
                const { error: unlikeError } = await supabase
                    .from('likes')
                    .delete()
                    .eq('post_id', postId)
                    .eq('user_id', user.id);

                if (unlikeError) throw unlikeError;

                setSelectedPost(prev => prev ? {
                    ...prev,
                    liked_by_user: false,
                    like_count: (prev.like_count || 0) - 1
                } : null);
            } else {
                // Like
                const { error: likeError } = await supabase
                    .from('likes')
                    .insert({
                        post_id: postId,
                        user_id: user.id
                    });

                if (likeError) throw likeError;

                setSelectedPost(prev => prev ? {
                    ...prev,
                    liked_by_user: true,
                    like_count: (prev.like_count || 0) + 1
                } : null);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
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
        }
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
        }
    };

    const handleNotificationClick = async (postId: string) => {
        try {
            const { data: postData, error } = await supabase
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
                .eq('post_id', postId)
                .single();

            if (error) throw error;

            if (postData) {
                const isLikedByUser = postData.likes?.some(
                    (like: { user_id: string }) => like.user_id === user?.id
                );

                const post: Post = {
                    post_id: postData.post_id,
                    post_content: postData.post_content,
                    user_id: postData.user_id,
                    username: postData.users.username,
                    user_avatar_url: postData.users.user_avatar_url,
                    post_created_at: postData.post_created_at,
                    post_updated_at: postData.post_updated_at,
                    image_urls: postData.image_urls,
                    like_count: postData.likes?.length || 0,
                    comment_count: postData.comment_count || 0,
                    liked_by_user: isLikedByUser || false
                };

                setSelectedPost(post);
                setShowFullViewModal(true);
                await fetchComments(postId);
            }
        } catch (error) {
            console.error('Error fetching post:', error);
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

    const renderComment = (comment: Comment) => (
        <div key={comment.id} style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
                <IonAvatar style={{ width: '32px', height: '32px' }}>
                    {comment.user_avatar_url ? (
                        <img src={comment.user_avatar_url} alt={comment.username} />
                    ) : (
                        <IonIcon icon={personOutline} />
                    )}
                </IonAvatar>
                <div style={{ flex: 1 }}>
                    <div style={{ 
                        background: 'var(--ion-color-light)',
                        padding: '8px 12px',
                        borderRadius: '12px',
                        display: 'inline-block'
                    }}>
                        <p style={{ 
                            margin: 0,
                            fontSize: '0.9rem',
                            fontWeight: 600
                        }}>
                            {comment.username}
                        </p>
                        <p style={{ 
                            margin: '4px 0 0',
                            fontSize: '0.9rem',
                            color: 'var(--ion-text-color)'
                        }}>
                            {comment.content}
                        </p>
                    </div>
                    <p style={{ 
                        margin: '4px 0 0',
                        fontSize: '0.8rem',
                        color: 'var(--ion-color-medium)'
                    }}>
                        {formatTimeAgo(comment.created_at)}
                    </p>
                </div>
            </div>
            {comment.replies && comment.replies.length > 0 && (
                <div style={{ marginLeft: '44px', marginTop: '8px' }}>
                    {comment.replies.map(reply => renderComment(reply))}
                </div>
            )}
        </div>
    );

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot='start'>
                        <IonMenuButton></IonMenuButton>
                    </IonButtons>
                    <IonTitle>Notifications</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                {loading ? (
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        height: '100%' 
                    }}>
                        <IonSpinner name="crescent" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        height: '100%',
                        textAlign: 'center',
                        padding: '20px'
                    }}>
                        <IonText color="medium">No notifications yet</IonText>
                    </div>
                ) : (
                    <IonList>
                        {notifications.map((notification) => (
                            <IonItem 
                                key={notification.id} 
                                style={{
                                    padding: '12px 16px',
                                    margin: '8px 0',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s ease'
                                }}
                                onClick={() => handleNotificationClick(notification.post_id)}
                                button
                            >
                                <IonAvatar slot="start" style={{ width: '40px', height: '40px', marginRight: '12px' }}>
                                    {notification.user_avatar_url ? (
                                        <img src={notification.user_avatar_url} alt={notification.username} />
                                    ) : (
                                        <IonIcon icon={personOutline} />
                                    )}
                                </IonAvatar>
                                <IonLabel>
                                    <h2 style={{ fontSize: '0.9rem', marginBottom: '4px' }}>
                                        <strong>{notification.username}</strong>{' '}
                                        {getNotificationText(notification)}
                                    </h2>
                                    <p style={{ 
                                        fontSize: '0.8rem', 
                                        color: 'var(--ion-color-medium)',
                                        margin: '4px 0',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {notification.post_content}
                                    </p>
                                    <p style={{ 
                                        fontSize: '0.7rem', 
                                        color: 'var(--ion-color-medium)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        <IonIcon icon={timeOutline} />
                                        {formatTimeAgo(notification.created_at)}
                                    </p>
                                </IonLabel>
                                <IonIcon 
                                    icon={getNotificationIcon(notification.type)} 
                                    slot="end"
                                    color={notification.type === 'like' ? 'danger' : 'primary'}
                                    style={{ fontSize: '1.2rem' }}
                                />
                            </IonItem>
                        ))}
                    </IonList>
                )}

                {/* Full View Modal */}
                <IonModal
                    isOpen={showFullViewModal}
                    onDidDismiss={() => {
                        setShowFullViewModal(false);
                        setSelectedPost(null);
                        setSelectedPostComments([]);
                    }}
                    style={{ '--width': '100%', '--height': '100%', '--border-radius': '0' }}
                >
                    <IonHeader>
                        <IonToolbar>
                            <IonTitle>Post</IonTitle>
                            <IonButtons slot="end">
                                <IonButton onClick={() => setShowFullViewModal(false)}>
                                    <IonIcon icon={closeOutline} />
                                </IonButton>
                            </IonButtons>
                        </IonToolbar>
                    </IonHeader>
                    <IonContent style={{ '--background': 'var(--ion-color-light)' }}>
                        {selectedPost && (
                            <div style={{ 
                                display: 'flex',
                                flexDirection: 'column',
                                minHeight: '100%',
                                background: 'var(--ion-background-color)',
                                position: 'relative',
                                paddingBottom: '80px'
                            }}>
                                <div style={{ 
                                    flex: 1,
                                    padding: '16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    minWidth: 0
                                }}>
                                    <div style={{ 
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '8px 0'
                                    }}>
                                        <IonAvatar style={{ width: '48px', height: '48px' }}>
                                            {selectedPost.user_avatar_url ? (
                                                <img src={selectedPost.user_avatar_url} alt={selectedPost.username} />
                                            ) : (
                                                <IonIcon icon={personOutline} />
                                            )}
                                        </IonAvatar>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ 
                                                fontSize: '1rem',
                                                fontWeight: 600,
                                                margin: 0
                                            }}>
                                                {selectedPost.username}
                                            </p>
                                            <p style={{ 
                                                fontSize: '0.8rem',
                                                color: 'var(--ion-color-medium)',
                                                margin: '4px 0 0'
                                            }}>
                                                {formatDate(selectedPost.post_created_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <p style={{ 
                                        fontSize: '1rem',
                                        lineHeight: 1.5,
                                        margin: '16px 0',
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {selectedPost.post_content}
                                    </p>
                                    {selectedPost.image_urls && selectedPost.image_urls.length > 0 && (
                                        <div style={{ 
                                            width: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '16px',
                                            margin: '16px 0'
                                        }}>
                                            {selectedPost.image_urls.map((url, index) => (
                                                <div key={index} style={{ 
                                                    width: '100%',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center'
                                                }}>
                                                    <img 
                                                        src={url} 
                                                        style={{ 
                                                            maxWidth: '100%',
                                                            maxHeight: '70vh',
                                                            objectFit: 'contain',
                                                            borderRadius: '8px'
                                                        }} 
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div style={{ 
                                        margin: '16px 0',
                                        padding: '8px 0',
                                        borderTop: '1px solid var(--ion-color-light)',
                                        borderBottom: '1px solid var(--ion-color-light)'
                                    }}>
                                        <p style={{ 
                                            margin: '4px 0',
                                            color: 'var(--ion-text-color)',
                                            fontSize: '0.9rem',
                                            fontWeight: 600
                                        }}>
                                            {selectedPost.like_count} {selectedPost.like_count === 1 ? 'person' : 'people'} liked this
                                        </p>
                                        <p style={{ 
                                            margin: '4px 0',
                                            color: 'var(--ion-color-medium)',
                                            fontSize: '0.9rem'
                                        }}>
                                            {selectedPost.comment_count} {selectedPost.comment_count === 1 ? 'comment' : 'comments'}
                                        </p>
                                    </div>
                                    <div style={{ 
                                        display: 'flex',
                                        gap: '16px',
                                        marginTop: '8px'
                                    }}>
                                        <IonButton
                                            fill="clear"
                                            style={{ 
                                                '--color': selectedPost.liked_by_user ? 'var(--ion-color-danger)' : 'var(--ion-color-primary)'
                                            }}
                                            onClick={() => toggleLike(selectedPost.post_id)}
                                        >
                                            <IonIcon 
                                                icon={selectedPost.liked_by_user ? heart : heartOutline} 
                                                slot="start"
                                            />
                                            {selectedPost.liked_by_user ? 'Unlike' : 'Like'}
                                        </IonButton>
                                        {(selectedPost.like_count ?? 0) > 0 && (
                                            <IonButton
                                                fill="clear"
                                                onClick={() => showLikedBy(selectedPost.post_id)}
                                            >
                                                <IonIcon icon={peopleOutline} slot="start" />
                                                View likes
                                            </IonButton>
                                        )}
                                    </div>
                                </div>
                                <div style={{ 
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    borderTop: '1px solid var(--ion-color-light)',
                                    background: 'var(--ion-background-color)',
                                    marginTop: '16px'
                                }}>
                                    <div style={{ 
                                        flex: 1,
                                        overflowY: 'auto',
                                        padding: '12px',
                                        maxHeight: '300px'
                                    }}>
                                        {selectedPostComments.length > 0 ? (
                                            selectedPostComments.map(comment => renderComment(comment))
                                        ) : (
                                            <div style={{ 
                                                textAlign: 'center',
                                                padding: '16px',
                                                color: 'var(--ion-color-medium)'
                                            }}>
                                                <p>No comments yet. Be the first to comment!</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
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
                                    <IonAvatar slot="start" style={{ width: '40px', height: '40px' }}>
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
            </IonContent>
        </IonPage>
    );
};

export default Notification; 