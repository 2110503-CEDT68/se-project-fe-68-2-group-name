import Image from 'next/image';
import Link from 'next/link';
import InteractiveCard from './InteractiveCard';

export default function CoWorkingSpaceCard({
  coId, coName, coAddress, coTel, coOpenCloseTime, imgSrc, coDesc, coPrice
}: {
  coId: string, coName: string, coAddress: string, coTel: string, coOpenCloseTime: string, imgSrc: string, coDesc: string, coPrice:number
}) {

  return (
    <InteractiveCard contentName={coName}>
      <div className='w-full h-48 relative rounded-t-lg bg-gray-100'>
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