import React, {useEffect} from 'react';
import useState from "react-usestateref";

interface DetailsDescriptionCardProps{
    description: string;
}

const DetailsDescriptionCard: React.FC<DetailsDescriptionCardProps> = ({description}) => {
    useEffect(() => console.log(description))
  return (
    <div className="bg-quartiary/90 rounded-xl flex flex-col items-center lg:flex-row p-6">
    {description}
    </div>
  )
}

export default DetailsDescriptionCard