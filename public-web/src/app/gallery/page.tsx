import Image from 'next/image';
import { getGalleryImages } from '@/lib/api';

export const metadata = {
  title: 'Gallery',
  description: 'Explore our hotel through images',
};

export default async function GalleryPage() {
  let galleryData = { data: [] as any[] };
  try {
    galleryData = await getGalleryImages();
  } catch (error) {
    console.error('Failed to fetch gallery:', error);
  }

  const images = galleryData?.data || [];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">Gallery</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          A glimpse of our rooms, dining, and spaces.
        </p>
      </div>

      {images.length === 0 ? (
        <p className="text-center text-muted-foreground">No images to display yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img: any) => (
            <div key={img._id} className="relative aspect-square rounded-lg overflow-hidden group">
              <Image
                src={img.imageUrl || '/placeholder-room.jpg'}
                alt={img.altText || img.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
