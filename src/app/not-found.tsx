import '@/styles/page-not-found.css';
import Link from 'next/link';
// import { Metadata } from 'next';
import { Josefin_Sans } from 'next/font/google';
import Image from 'next/image';

const josefin = Josefin_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
});

// export const metadata: Metadata = {
//   title: '404 - Page Not Found',
//   description:
//     'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.',
// };

export default function NotFound() {
  return (
    <div id='notfound' className={`${josefin.className}`}>
      <Image
        src='/main-icon-1024x1024.png'
        width={150}
        height={150}
        alt=''
        className='main-icon'
      />
      <div className='notfound'>
        <div className='notfound-404'>
          <h1>
            4<span>0</span>4
          </h1>
        </div>
        <p>
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>
        <Link href='/'>home page</Link>
      </div>
    </div>
  );
}
