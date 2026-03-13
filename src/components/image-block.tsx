import Image from "next/image";

export interface ImageBlockProps {
  src: string;
  alt: string;
  caption?: string;
  width?: string;
}

export function ImageBlock({
  src,
  alt,
  caption,
  width = "100%",
}: ImageBlockProps) {
  return (
    <figure className="space-y-token-sm" style={{ width }}>
      <Image
        src={src}
        alt={alt}
        width={1200}
        height={720}
        unoptimized
        className="h-auto w-full rounded-[1.5rem] border border-gray-200 object-cover shadow-token-md"
      />
      {caption ? (
        <figcaption className="text-caption text-gray-500">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

export default ImageBlock;
