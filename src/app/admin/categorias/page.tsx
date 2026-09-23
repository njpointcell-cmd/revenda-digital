import {requireAdmin} from '@/services/auth/session';
import {db} from '@/lib/db';
import {CategoryForm} from '@/components/admin/category-form';
export default async function Categories(){await requireAdmin();const categories=await db.category.findMany({orderBy:{name:'asc'}});return <><h1>Categorias</h1><div className="split"><CategoryForm/>{categories.map(c=><CategoryForm key={c.id} category={c}/>)}</div></>;}
