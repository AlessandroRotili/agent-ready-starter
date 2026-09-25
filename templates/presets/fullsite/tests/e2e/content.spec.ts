import { test, expect } from '@playwright/test';
import { project } from '../../config/project';
test('public content uses the selected repository and has a usable empty state',async({page})=>{
  await page.goto('/content');
  await expect(page.getByRole('heading',{name:'Contenuti',exact:true})).toBeVisible();
  if(['none','mock'].includes(String(project.provider))) {
    await page.getByRole('link',{name:'Un nuovo inizio'}).click();
    await expect(page.getByRole('heading',{name:'Un nuovo inizio'})).toBeVisible();
  } else if(String(project.provider)==='generic') {
    await expect(page.getByText('Contenuti non ancora disponibili.')).toBeVisible();
  }
});
