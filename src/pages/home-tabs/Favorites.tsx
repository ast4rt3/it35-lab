import { useState, useEffect } from 'react';
import {
  IonContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonPage,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent
} from '@ionic/react';

const Favorites: React.FC = () => {
  const [items, setItems] = useState<string[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const fetchCatFacts = async () => {
    try {
      const response = await fetch('https://catfact.ninja/facts?limit=10');
      const data = await response.json();
      return data.data.map((fact: { fact: string }) => fact.fact);
    } catch (error) {
      console.error('Error fetching cat facts:', error);
      return [];
    }
  };

  const loadMore = async (event: CustomEvent<void>) => {
    const newFacts = await fetchCatFacts();
    setItems((prevItems) => [...prevItems, ...newFacts]);

    if (items.length + newFacts.length >= 50) {
      setHasMore(false);
    }

    (event.target as HTMLIonInfiniteScrollElement)?.complete();
  };

  useEffect(() => {
    fetchCatFacts().then((initialFacts) => setItems(initialFacts));
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Cat Facts</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {items.map((fact, index) => (
          <IonCard key={index}>
            <IonCardHeader>
              <IonCardTitle style={{ color: 'white' }}>Cat Fact {index + 1}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>{fact}</IonCardContent>
          </IonCard>
        ))}

        <IonInfiniteScroll onIonInfinite={loadMore} threshold="100px" disabled={!hasMore}>
          <IonInfiniteScrollContent loadingText="Loading more cat facts..." />
        </IonInfiniteScroll>
      </IonContent>
    </IonPage>
  );
};

export default Favorites;
