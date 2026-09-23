import {notFound} from 'next/navigation';
import {catalogRepository} from '@/repositories/catalog';
import {CatalogView} from '@/components/catalog/catalog-view';
export default async function Category({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<Record<string,string|undefined>>}){const {slug}=await params;const category=(await catalogRepository.categories()).find(c=>c.slug===slug);if(!category)notFound();return <><h1>{category.name}</h1><p>{category.description}</p><CatalogView params={await searchParams} category={slug}/></>;}
