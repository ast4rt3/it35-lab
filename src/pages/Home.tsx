import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/react';
import { bookOutline, star } from 'ionicons/icons';
import { Route } from 'react-router';
import Feed from './home-tabs/Feed';

const Home: React.FC = () => {
  const tabs = [
    { name: 'Feed', tab: 'feed', url: '/it35-lab/app/home/feed', icon: bookOutline },
  ];

  return (
    <IonTabs>
      <IonRouterOutlet>
        {/* Define routes for feed and favorites tabs */}
        <Route exact path="/it35-lab/app/home/feed" component={Feed} />

        {/* Default route for /home to show Feed component */}
        <Route exact path="/it35-lab/app/home" component={Feed} />
      </IonRouterOutlet>

   
    </IonTabs>
  );
};

export default Home;
