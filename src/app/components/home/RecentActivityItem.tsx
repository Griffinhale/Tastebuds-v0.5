import Link from "next/link";
import Image from "next/image";

interface RecentActivityItemProps {
    user: string;
    type: string;
    destination: string;
    listName?: string;
    itemTitle: string;
    itemId: string;
    date: string;
    cover: string; // Add cover URL prop
  }

const RecentActivityItem = ({
  user,
  type,
  destination,
  listName,
  itemTitle,
  itemId,
  date,
  cover
}: RecentActivityItemProps) => {
  return (
    <div className="my-4 inline-flex w-full border-b-1 border-white">
      <div className="w-10 h-10 bg-slate-500 rounded-xl mx-4"></div>
      <div className="flex-col ml-16 flex-grow">
        <p>
          <Link className="font-bold" href="/">{user}</Link> added the {type} <Link className="font-bold" href={`/details/${type}/${itemId}`}>{itemTitle}</Link> to their {destination}
          {listName && `: ${listName}`}.
        </p>
        <p>{date}</p>
      </div>
      <div className="relative w-10 h-10 mx-4">
      <Image 
            src={cover} 
            alt={`${itemTitle} cover`} 
            layout="fill" 
            objectFit="cover" 
            className="w-full h-full object-cover rounded-md transform transition-transform duration-300 ease-in-out hover:scale-150"
          />
      </div>
    </div>
  );
};

export default RecentActivityItem;