import Image from 'next/image';
import Link from 'next/link';
import InteractiveCard from './InteractiveCard';
import { Rating } from '@mui/material';

export default function CoWorkingSpaceCard({
  coId, coName, coAddress, coTel, coOpenCloseTime, imgSrc, coDesc, coPrice, averageRating, ratingsQuantity
}: {
  coId: string, coName: string, coAddress: string, coTel: string, coOpenCloseTime: string, imgSrc: string, coDesc: string, coPrice:number,
  averageRating?: number,
  ratingsQuantity?: number
}) {

  return (
    <InteractiveCard contentName={coName}>
      <div className='w-full h-45 relative rounded-t-lg bg-gray-100'>
        <Image 
          src={imgSrc}
          alt='Product Picture'
          fill={true}
          unoptimized
          className='object-cover rounded-t-lg' 
        />
      </div>
      
      <div className='w-full p-4 flex flex-col gap-1 text-sm'>
        <div className='text-lg font-bold text-black'>{coName}</div>
        <div className="flex items-center gap-2 mb-1">
          <Rating 
            value={averageRating} 
            readOnly 
            size="small" 
            precision={0.1} // ทำให้แสดงดาวแบบมีจุดทศนิยมได้ (เช่น 4.5)
          />
          <span className="text-xs text-gray-500">
            ({averageRating ? Number(averageRating).toFixed(1) : "0"} / {ratingsQuantity || 0} reviews)
          </span>
        </div>
        <div>📍: {coAddress}</div>
        <div>📞: {coTel}</div>
        <div>🕛: {coOpenCloseTime}</div>
        <div>💵: {coPrice}/hr</div>

        
        <button className='w-full rounded-md bg-blue-500 hover:bg-blue-600 px-4 py-2 shadow-sm text-white transition-colors'>
            Reserve Now
        </button>
        
      </div>
    </InteractiveCard>
  );
}