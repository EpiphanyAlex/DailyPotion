import { CabinetClient } from '@/components/cabinet/cabinet-client'
import type { Locale } from '@/lib/matching'
import { createServerSupabase } from '@/lib/supabase/server'
import { fetchRecipesWithIngredients, fetchSpiritTypes, fetchUserBottles } from '@/lib/supabase/queries'
import { toRecipeForMatching } from '@/lib/supabase/transform'

export default async function CabinetPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const sb = await createServerSupabase()
  const [rows, spiritTypes, recipes] = await Promise.all([
    fetchUserBottles(sb),
    fetchSpiritTypes(sb),
    fetchRecipesWithIngredients(sb),
  ])

  return (
    <CabinetClient
      locale={locale as Locale}
      initialRows={rows}
      spiritTypes={spiritTypes}
      recipes={recipes.map(toRecipeForMatching)}
    />
  )
}
