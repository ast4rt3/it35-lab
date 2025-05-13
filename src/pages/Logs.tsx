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
      IonIcon,
      IonText,
      IonChip,
      IonBadge,
      IonButton,
      IonModal,
      IonInput,
      IonTextarea,
      IonSelect,
      IonSelectOption,
      IonToast,
      IonFab,
      IonFabButton
  } from '@ionic/react';
import { 
  addCircleOutline, 
  chatbubbleOutline, 
  imageOutline, 
  heartOutline, 
  personOutline,
  timeOutline,
  addOutline,
  add
} from 'ionicons/icons';
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import './Logs.css';

interface Update {
  id?: number;
  date: string;
  title: string;
  description: string;
  type: 'feature' | 'fix' | 'enhancement';
  icon: string;
  created_at?: string;
}

const Logs: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [updates, setUpdates] = useState<Update[]>([]);
  const [newUpdate, setNewUpdate] = useState<Partial<Update>>({
    title: '',
    description: '',
    type: 'enhancement',
    icon: addCircleOutline
  });

  useEffect(() => {
    checkAdminStatus();
    fetchUpdates();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setIsAdmin(profile?.is_admin || false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const fetchUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from('updates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUpdates(data || []);
    } catch (error) {
      console.error('Error fetching updates:', error);
      setToastMessage('Error loading updates');
      setShowToast(true);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feature':
        return 'primary';
      case 'fix':
        return 'danger';
      case 'enhancement':
        return 'success';
      default:
        return 'medium';
    }
  };

  const handleAddUpdate = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('updates')
        .insert([
          {
            ...newUpdate,
            date: new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            user_id: user.id
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setShowAddModal(false);
      setToastMessage('Update added successfully');
      setShowToast(true);
      setNewUpdate({
        title: '',
        description: '',
        type: 'enhancement',
        icon: addCircleOutline
      });
      
      // Refresh the updates list
      fetchUpdates();
    } catch (error) {
      console.error('Error adding update:', error);
      setToastMessage('Error adding update');
      setShowToast(true);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot='start'>
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Update Logs</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="logs-container">
          <div className="logs-header">
            <h2>Recent Updates</h2>
            <p>Track the latest changes and improvements to the application</p>
          </div>
          <IonList className="logs-list">
            {updates.map((update, index) => (
              <IonItem key={update.id || index} className="log-item">
                <div className="log-content">
                  <div className="log-header">
                    <IonIcon icon={update.icon} className="log-icon" />
                    <IonLabel>
                      <h2>{update.title}</h2>
                      <div className="log-meta">
                        <IonChip color={getTypeColor(update.type)}>
                          {update.type}
                        </IonChip>
                        <span className="log-date">
                          <IonIcon icon={timeOutline} />
                          {update.date}
                        </span>
                      </div>
                    </IonLabel>
                  </div>
                  <IonText className="log-description">
                    <p>{update.description}</p>
                  </IonText>
                </div>
              </IonItem>
            ))}
          </IonList>
        </div>

        {isAdmin && (
          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton 
              className="new-post-button" 
              onClick={() => setShowAddModal(true)}
            >
              <IonIcon icon={add} />
            </IonFabButton>
          </IonFab>
        )}

        {/* Add Update Modal */}
        <IonModal isOpen={showAddModal} onDidDismiss={() => setShowAddModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Add New Update</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowAddModal(false)}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <div className="add-update-form">
              <IonInput
                label="Title"
                labelPlacement="floating"
                value={newUpdate.title}
                onIonChange={e => setNewUpdate({ ...newUpdate, title: e.detail.value! })}
                placeholder="Enter update title"
              />
              
              <IonTextarea
                label="Description"
                labelPlacement="floating"
                value={newUpdate.description}
                onIonChange={e => setNewUpdate({ ...newUpdate, description: e.detail.value! })}
                placeholder="Enter update description"
                rows={4}
              />

              <IonSelect
                label="Type"
                labelPlacement="floating"
                value={newUpdate.type}
                onIonChange={e => setNewUpdate({ ...newUpdate, type: e.detail.value })}
              >
                <IonSelectOption value="feature">Feature</IonSelectOption>
                <IonSelectOption value="fix">Fix</IonSelectOption>
                <IonSelectOption value="enhancement">Enhancement</IonSelectOption>
              </IonSelect>

              <IonButton expand="block" onClick={handleAddUpdate} className="ion-margin-top">
                Add Update
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="bottom"
        />
      </IonContent>
    </IonPage>
  );
};

export default Logs;