import React from 'react';
import { IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem } from '@ionic/react';
import { useHistory } from 'react-router-dom';

const Sidemenu: React.FC = () => {
  const history = useHistory();

  return (
    <IonMenu side="start" contentId="main-content">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Menu</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItem button onClick={() => history.push('./home')}>Home</IonItem>
          <IonItem button onClick={() => history.push('./details')}>Details</IonItem>
          <IonItem button onClick={() => history.push('./login')}>Logout</IonItem>
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default Sidemenu;
