import { 
  IonButton,
  IonButtons,
    IonContent, 
    IonHeader, 
    IonIcon, 
    IonItem, 
    IonMenu, 
    IonMenuToggle, 
    IonPage, 
    IonRouterOutlet, 
    IonSplitPane, 
    IonTitle, 
    IonToolbar 
} from '@ionic/react'
import {homeOutline,
     logOutOutline, bookOutline,
     hammerOutline,
     notificationsOutline,
    calendarOutline,
    menuOutline,
    colorFill} from 'ionicons/icons';
import { Redirect, Route } from 'react-router';
import Home from './Home';
import Logs from './Logs';
import IncidentAndReport from './IncidentAndReport';
import AlertAndNotification from './AlertAndNotification';
import EventMonitoring from './EventMonitoring';
import './Menu.css'; // Import the CSS file for custom styles


const Menu: React.FC = () => {
  const path = [
      {name:'Home', url: '/it35-lab/app/home', icon: homeOutline},
      {name:'Logs', url: '/it35-lab/app/Logs', icon: bookOutline},
      {name:'Incidents & Reports', url: '/it35-lab/app/IncidentAndReport', icon: hammerOutline},
      {name:'Alerts & Notfications', url: '/it35-lab/app/AlertAndNotification', icon: notificationsOutline},
      {name:'Events Monitoring', url: '/it35-lab/app/EventMonitoring', icon: calendarOutline}

  ]

  return (
      <>
      <IonPage > 
          <IonSplitPane contentId="main" when="always"> {/* Ensure the menu is always visible */}
              <IonMenu contentId="main" className="custom-menu-width">
                  <IonHeader>
                      <IonToolbar >
                          <IonButtons slot="start">
                              <IonMenuToggle>
                                  <IonButton>
                                      <IonIcon icon={menuOutline} slot="icon-only" />
                                  </IonButton>
                              </IonMenuToggle>
                          </IonButtons>
                          <IonTitle>
                              Home
                          </IonTitle>
                      </IonToolbar>
                  </IonHeader>
                  <IonContent className="menu-content"> 
                      {path.map((item, index) => (
                          <IonMenuToggle key={index}>
                              <IonItem routerLink={item.url} routerDirection="forward">
                                  <IonIcon icon={item.icon} slot="start"></IonIcon>
                                  {item.name}
                              </IonItem>
                          </IonMenuToggle>
                      ))}

                      <IonButton routerLink="/it35-lab" routerDirection="back" expand="full">
                          <IonIcon icon={logOutOutline} slot="start"> </IonIcon>
                          Logout
                      </IonButton>
                  </IonContent>
              </IonMenu>
              <IonRouterOutlet id="main">
                  <Route exact path="/it35-lab/app/home" component={Home} />
                  <Route exact path="/it35-lab/app/logs" component={Logs} />
                  <Route exact path="/it35-lab/app/IncidentAndReport" component={IncidentAndReport} />
                  <Route exact path="/it35-lab/app/AlertAndNotification" component={AlertAndNotification} />
                  <Route exact path="/it35-lab/app/EventMonitoring" component={EventMonitoring} />
                  <Route exact path="/it35-lab/app">
                      <Redirect to="/it35-lab/app/home" />
                  </Route>
              </IonRouterOutlet>
          </IonSplitPane>
      </IonPage>
      </>
  );
}

export default Menu;