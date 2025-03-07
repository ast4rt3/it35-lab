import { 
      IonIcon, 
      IonLabel, 
      IonRouterOutlet, 
      IonTabBar, 
      IonTabButton, 
      IonTabs, 
  } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { bookOutline, search, star } from 'ionicons/icons';
import { Route, Redirect } from 'react-router';


import Favorites from './home-tabs/Favorites';
import Feed from './home-tabs/Feed';



const Home: React.FC = () => {
  const tabs = [
    { name: 'Feed', tab: 'feed', url: '/it35-lab/app/home/feed', icon: bookOutline },
    { name: 'Favorites', tab: 'favorites', url: '/it35-lab/app/home/favorites', icon: star },
  ];

  return (
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Route exact path="/it35-lab/app/home/feed" component={Feed} />
          <Route exact path="/it35-lab/app/home/favorites" component={Favorites} />
          <Route exact path="/it35-lab/app/home">
            <Redirect to="/it35-lab/app/home/feed" />
          </Route>
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
    </IonReactRouter>
  );
};

export default Home;