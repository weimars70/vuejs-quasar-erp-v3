import { createRouter, createWebHistory } from 'vue-router';
import routes from './routes';
import { useTabStore } from '../stores/tab';

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const tabStore = useTabStore();
  
  // If route exists and it's not already in tabs, add it
  if (to.name && to.path !== from.path) {
    const matchedRoute = routes[0].children?.find(route => route.path === to.path);
    if (matchedRoute) {
      tabStore.addTab({
        path: to.path,
        label: matchedRoute.name?.toString().toUpperCase() || '',
        icon: getIconForRoute(to.path)
      });
    }
  }
  
  next();
});

function getIconForRoute(path: string): string {
  const icons: Record<string, string> = {
    '/': 'home',
    '/colors': 'palette',
    '/sizes': 'straighten',
    '/item-groups': 'category',
    '/purchases': 'shopping_cart',
    '/roles': 'admin_panel_settings'
  };
  
  return icons[path] || 'help';
}

export default router;