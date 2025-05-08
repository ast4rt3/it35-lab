import {
  IonButtons,
  IonCard,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonButton,
  IonText,
  IonList,
  IonItem,
  IonLabel,
  IonBadge
} from '@ionic/react';
import { 
  addOutline, 
  alertCircleOutline, 
  calendarOutline, 
  notificationsOutline,
  trendingUpOutline,
  peopleOutline
} from 'ionicons/icons';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import './Feed.css';

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  created_at: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  status: 'upcoming' | 'ongoing' | 'completed';
}

const Feed: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (alertsError) throw alertsError;
      setAlerts(alertsData || []);

      // Fetch events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true })
        .limit(5);

      if (eventsError) throw eventsError;
      setEvents(eventsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'primary';
    }
  };

  const getEventStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'warning';
      case 'completed':
        return 'success';
      case 'upcoming':
        return 'primary';
      default:
        return 'medium';
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot='start'>
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonGrid>
          {/* Overview Cards */}
          <IonRow>
            <IonCol size="12" sizeMd="6" sizeLg="3">
              <IonCard className="dashboard-card">
                <IonIcon icon={alertCircleOutline} color="danger" size="large" />
                <IonText>
                  <h2>Active Alerts</h2>
                  <p>{alerts.filter(a => a.severity === 'high').length}</p>
                </IonText>
              </IonCard>
            </IonCol>
            <IonCol size="12" sizeMd="6" sizeLg="3">
              <IonCard className="dashboard-card">
                <IonIcon icon={calendarOutline} color="primary" size="large" />
                <IonText>
                  <h2>Upcoming Events</h2>
                  <p>{events.filter(e => e.status === 'upcoming').length}</p>
                </IonText>
              </IonCard>
            </IonCol>
            <IonCol size="12" sizeMd="6" sizeLg="3">
              <IonCard className="dashboard-card">
                <IonIcon icon={trendingUpOutline} color="success" size="large" />
                <IonText>
                  <h2>Total Incidents</h2>
                  <p>24</p>
                </IonText>
              </IonCard>
            </IonCol>
            <IonCol size="12" sizeMd="6" sizeLg="3">
              <IonCard className="dashboard-card">
                <IonIcon icon={peopleOutline} color="warning" size="large" />
                <IonText>
                  <h2>Active Users</h2>
                  <p>156</p>
                </IonText>
              </IonCard>
            </IonCol>
          </IonRow>

          {/* Alerts Section */}
          <IonRow>
            <IonCol size="12" sizeMd="6">
              <IonCard>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
                  <IonText>
                    <h2 style={{ margin: 0 }}>Recent Alerts</h2>
                  </IonText>
                  <IonButton fill="clear" size="small">
                    <IonIcon icon={addOutline} slot="start" />
                    New Alert
                  </IonButton>
                </div>
                <IonList>
                  {alerts.map((alert) => (
                    <IonItem key={alert.id}>
                      <IonLabel>
                        <h3>{alert.title}</h3>
                        <p>{alert.description}</p>
                      </IonLabel>
                      <IonBadge slot="end" color={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </IonBadge>
                    </IonItem>
                  ))}
                </IonList>
              </IonCard>
            </IonCol>

            {/* Events Section */}
            <IonCol size="12" sizeMd="6">
              <IonCard>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
                  <IonText>
                    <h2 style={{ margin: 0 }}>Upcoming Events</h2>
                  </IonText>
                  <IonButton fill="clear" size="small">
                    <IonIcon icon={addOutline} slot="start" />
                    New Event
                  </IonButton>
                </div>
                <IonList>
                  {events.map((event) => (
                    <IonItem key={event.id}>
                      <IonLabel>
                        <h3>{event.title}</h3>
                        <p>{event.location} - {new Date(event.date).toLocaleDateString()}</p>
                      </IonLabel>
                      <IonBadge slot="end" color={getEventStatusColor(event.status)}>
                        {event.status}
                      </IonBadge>
                    </IonItem>
                  ))}
                </IonList>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Feed;
