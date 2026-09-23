import {CatalogView} from '@/components/catalog/catalog-view';
export const dynamic='force-dynamic';
export default async function Products({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){return <><span className="eyebrow">Explore a NJ Story</span><h1>Catálogo digital</h1><CatalogView params={await searchParams}/></>;}
