export default function Loading() {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen'>
      <div className='relative w-24 h-24'>
        <img
          src='/main-icon-1024x1024.png'
          alt='Loading'
          className='block animate-bounce w-full h-full rounded-2xl'
        />
      </div>
      <span className='sr-only'>Loading...</span>
    </div>
  );
}
