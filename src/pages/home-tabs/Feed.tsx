import {
  IonButtons,
  IonCard,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/react';

import React, { useState } from 'react';




const Feed: React.FC = () => {



  return (
      <IonPage>
          <IonHeader>
              <IonToolbar>
                  <IonButtons slot='start'>
                      <IonMenuButton></IonMenuButton>
                  </IonButtons>
                  <IonTitle>Home</IonTitle>
              </IonToolbar>
          </IonHeader>
          <IonContent fullscreen>
          <div className="dashboard-container">
        
          <IonCard className="overview">
            <h2>Overview</h2>
            
            <div className="chart-placeholder">[Chart Placeholder]</div>
          </IonCard>

          {/* Placeholder Chart */}
          <IonCard className="placeholder-chart">
            <h2>Add Subtitle Here</h2>
            <div className="chart-placeholder">[Placeholder]</div>
          </IonCard>

          {/* Alerts Section */}
          <IonCard className="alerts">
            <h2>Alerts</h2>
            <button className="add-alert">+</button>
            <div className="alert-placeholder">[Alert List]</div>
          </IonCard>

          {/* Events Section */}
          <IonCard className="events">
            <h2>Events</h2>
            
          </IonCard>
        </div>
          </IonContent>
      </IonPage>
  );
};

export default Feed;
