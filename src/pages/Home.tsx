import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/react';
import { bookOutline, star } from 'ionicons/icons';
import { Route } from 'react-router';

import Favorites from './home-tabs/Favorites';
import Feed from './home-tabs/Feed';

const Home: React.FC = () => {
  const tabs = [
    { name: 'Feed', tab: 'feed', url: '/it35-lab/app/home/feed', icon: bookOutline },
    { name: 'Favorites', tab: 'favorites', url: '/it35-lab/app/home/favorites', icon: star },
  ];

  return (
    <IonTabs>
      <IonRouterOutlet>
        {/* Define routes for feed and favorites tabs */}
        <Route exact path="/it35-lab/app/home/feed" component={Feed} />
        <Route exact path="/it35-lab/app/home/favorites" component={Favorites} />

        {/* Default route for /home to show Feed component */}
        <Route exact path="/it35-lab/app/home" component={Feed} />
      </IonRouterOutlet>

      <IonTabBar slot="bottom">
        {tabs.map((item, index) => (
          <IonTabButton key={index} tab={item.tab} href={item.url}>
            <IonIcon icon={item.icon} />
            <IonLabel>{item.name}</IonLabel>
          </IonTabButton>
        ))}
      </IonTabBar>
    </IonTabs>
  );
};

export default Home;
