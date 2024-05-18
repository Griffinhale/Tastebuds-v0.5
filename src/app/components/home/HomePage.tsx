import { useEffect, useState } from "react";
import Header from "../Header";
import RecentActivityItem from "./RecentActivityItem";
import supabase from "../../utils/supabaseClient";

// Define the type for an activity item
type Activity = {
  id: number;
  type: string;
  user_name: string;
  user_id: string;
  destination: string;
  list_id?: string;
  list_name?: string;
  item_id: string;
  item_title: string;
  created_at: string;
  cover: string; 
};

const HomePage = () => {
  // Explicitly type the useState hook
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchActivities = async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Error fetching activities:', error);
      } else {
        setActivities(data as Activity[]);  // Type assertion to inform TypeScript
      }
    };

    fetchActivities();
  }, []);

  return (
    <div className="flex flex-col h-4/5 min-h-[1200px] w-full rounded-xl text-primary">
      <Header />

      <div className="bg-primary/80 border-t-8 border-primary px-8 py-8 mt-1 rounded-xl text-black">
        <div className="border-b-2 h-auto border-primary rounded-xl">
          <div className="flex-row flex">
            <h1 className="font-bold text-xl pb-4 ml-4">Recent Activity</h1>
          </div>
        </div>

        <div className="flex-col py-4">
          {activities.map((activity) => (
            <RecentActivityItem
              key={activity.id}
              itemId={activity.item_id}
              user={activity.user_name}
              type={activity.type}
              destination={activity.destination}
              listName={activity.list_name}
              itemTitle={activity.item_title}
              date={new Date(activity.created_at).toLocaleDateString()}
              cover={activity.cover}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;