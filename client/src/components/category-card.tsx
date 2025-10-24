import { Link } from "wouter";

interface CategoryCardProps {
  name: string;
  image: string;
  href: string;
}

export function CategoryCard({ name, image, href }: CategoryCardProps) {
  return (
    <Link href={href}>
      <div className="group block cursor-pointer" data-testid={`card-category-${name.toLowerCase().replace(/\s+/g, '-')}`}>
        <div className="relative overflow-hidden rounded-xl aspect-[4/3] bg-muted">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <h3 className="font-serif text-3xl md:text-4xl font-semibold mb-2">{name}</h3>
            <span className="text-sm font-medium tracking-wider uppercase opacity-90 group-hover:opacity-100 transition-opacity">
              Shop Now →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
