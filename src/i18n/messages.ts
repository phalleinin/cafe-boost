export type Locale = "en" | "km";

export type Messages = {
  meta: {
    isKhmer: boolean;
  };

  common: {
    loading: string;
    signOut: string;
    language: string;
    english: string;
    khmer: string;
    owner: string;
    dashboard: string;
  };

  nav: {
    orders: string;
    analytics: string;
    menu: string;
    qrCode: string;
  };

  ownerLayout: {
    toggleSidebar: string;
  };

  orders: {
    title: string;
    autoRefresh: string;
    updatedAt: string;
    refresh: string;
    loadingOrders: string;
    emptyActive: string;
    emptyAll: string;
    unknownItem: string;
    updating: string;
    failedToLoadProfile: string;
    errorLoadingOrders: string;
    failedToUpdateStatus: string;
    pendingAlert: (count: number) => string;
    filters: {
      active: string;
      completed: string;
      all: string;
    };
    kpi: {
      newOrders: string;
      preparing: string;
      collected: string;
      totalToday: string;
    };
    status: {
      pending: string;
      preparing: string;
      completed: string;
    };
    actions: {
      startPreparing: string;
      markCompleted: string;
      completedPaid: string;
    };
  };

  analytics: {
    loading: string;
    failedToLoadProfile: string;
    failedToLoadAnalytics: string;
    unknownItem: string;
    period: {
      today: string;
      week: string;
      month: string;
    };
    cards: {
      totalOrders: string;
      totalRevenue: string;
      avgOrderValue: string;
      peakHour: string;
    };
    sub: {
      selectedPeriod: string;
      completedOrdersOnly: string;
      noData: string;
      noOrdersInPeriod: string;
      noOrdersYet: string;
      totalOrders: string;
      darkerMoreOrders: string;
    };
    sections: {
      dailyRevenue: string;
      orderCompletion: string;
      popularDrink: string;
      recentOrders: string;
      busiestHours: string;
    };
    completion: {
      completed: string;
    };
    time: {
      am: string;
      pm: string;
    };
    units: {
      orders: string;
    };
    empty: {
      noOrderData: string;
      noOrders: string;
    };
  };

  menu: {
    title: string;
    subtitle: string;
    addNewItem: string;
    loadingMenu: string;
    emptyState: string;
    unavailable: string;
    noDescription: string;
    generateQr: string;
    failedToLoadProfile: string;
    errorLoadingMenu: string;
    failedToUpdateAvailability: string;
    failedToDeleteItem: string;
    failedToUpdateItem: string;
    confirmDelete: string;
    searchPlaceholder: string;
    noSearchResults: string;
    categories: {
      hotDrinks: string;
      coldDrinks: string;
      frappe: string;
      otherDrinks: string;
      hot: string;
      cold: string;
    };
    actions: {
      edit: string;
      delete: string;
      deleting: string;
      updating: string;
      markUnavailable: string;
      markAvailable: string;
    };
    modal: {
      editTitle: string;
      itemImage: string;
      imagePreviewAlt: string;
      category: string;
      name: string;
      namePlaceholder: string;
      description: string;
      descriptionPlaceholder: string;
      price: string;
      cancel: string;
      saveChanges: string;
      saving: string;
    };
  };

  menuQR: {
    title: string;
    subtitle: string;
    loading: string;
    failedToLoadCafeInfo: string;
    downloadQr: string;
    previewMenu: string;
    hint: string;
  };

  dashboard: {
    title: string;
    liveUpdates: string;
    loadingOrders: string;
    retry: string;
    updating: string;
    guestName: string;
    unknownItem: string;
    failedToLoadProfile: string;
    errorLoadingOrders: string;
    failedToUpdateStatus: string;
    newOrderNotificationTitle: string;
    pendingAlert: (count: number) => string;
    notifications: {
      enablePrompt: string;
      allow: string;
    };
    columns: {
      newOrders: string;
      preparing: string;
      completed: string;
    };
    empty: {
      newOrders: string;
      preparing: string;
      completed: string;
    };
    actions: {
      startPreparing: string;
      markComplete: string;
      completedPaid: string;
    };
  };

  menuAdd: {
    title: string;
    subtitle: string;
    back: string;
    image: string;
    imagePreviewAlt: string;
    name: string;
    namePlaceholder: string;
    description: string;
    descriptionPlaceholder: string;
    price: string;
    available: string;
    cancel: string;
    add: string;
    adding: string;
    errors: {
      nameRequired: string;
      invalidPrice: string;
      noCafe: string;
      failedAdd: string;
    };
  };
};

export const messages: Record<Locale, Messages> = {
  en: {
    meta: { isKhmer: false },

    common: {
      loading: "Loading...",
      signOut: "Sign Out",
      language: "Language",
      english: "English",
      khmer: "Khmer",
      owner: "Owner",
      dashboard: "Dashboard",
    },

    nav: {
      orders: "Orders",
      analytics: "Analytics",
      menu: "Menu",
      qrCode: "QR Code",
    },

    ownerLayout: {
      toggleSidebar: "Toggle sidebar",
    },

    orders: {
      title: "Orders",
      autoRefresh: "Auto-refreshes every 30 seconds",
      updatedAt: "Updated",
      refresh: "Refresh",
      loadingOrders: "Loading orders...",
      emptyActive: "No active orders right now.",
      emptyAll: "No orders found.",
      unknownItem: "Unknown",
      updating: "Updating...",
      failedToLoadProfile: "Failed to load profile",
      errorLoadingOrders: "Error loading orders",
      failedToUpdateStatus: "Failed to update order status.",
      pendingAlert: (count: number) =>
        `${count} new order${count > 1 ? "s" : ""} waiting`,
      filters: {
        active: "Active",
        completed: "Completed",
        all: "All Orders",
      },
      kpi: {
        newOrders: "New Orders",
        preparing: "Preparing",
        collected: "Collected",
        totalToday: "Total Today",
      },
      status: {
        pending: "New Order",
        preparing: "Preparing",
        completed: "Done",
      },
      actions: {
        startPreparing: "Start Preparing",
        markCompleted: "Mark Completed",
        completedPaid: "Completed & Paid",
      },
    },

    analytics: {
      loading: "Loading analytics...",
      failedToLoadProfile: "Failed to load profile",
      failedToLoadAnalytics: "Failed to load analytics",
      unknownItem: "Unknown",
      period: {
        today: "Today",
        week: "7 Days",
        month: "30 Days",
      },
      cards: {
        totalOrders: "Total Orders",
        totalRevenue: "Total Revenue",
        avgOrderValue: "Avg Order Value",
        peakHour: "Peak Hour",
      },
      sub: {
        selectedPeriod: "in selected period",
        completedOrdersOnly: "completed orders only",
        noData: "no data",
        noOrdersInPeriod: "No orders in this period",
        noOrdersYet: "No orders yet",
        totalOrders: "total orders",
        darkerMoreOrders: "Darker = more orders · Hover to see exact count",
      },
      sections: {
        dailyRevenue: "Daily Revenue",
        orderCompletion: "Order Completion",
        popularDrink: "Popular Drinks",
        recentOrders: "Recent Orders",
        busiestHours: "Busiest Hours",
      },
      completion: {
        completed: "Completed",
      },
      time: {
        am: "AM",
        pm: "PM",
      },
      units: {
        orders: "orders",
      },
      empty: {
        noOrderData: "No order data yet",
        noOrders: "No orders yet",
      },
    },

    menu: {
      title: "Manage Menu",
      subtitle: "Add, edit, or remove items.",
      addNewItem: "Add New Item",
      loadingMenu: "Loading menu...",
      emptyState: "No menu items yet.",
      unavailable: "Unavailable",
      noDescription: "No description",
      generateQr: "Generate QR",
      failedToLoadProfile: "Failed to load profile",
      errorLoadingMenu: "Error loading menu",
      failedToUpdateAvailability: "Failed to update availability",
      failedToDeleteItem: "Failed to delete item",
      failedToUpdateItem: "Failed to update item",
      confirmDelete: "Delete this item?",
      searchPlaceholder: "Search drinks...",
      noSearchResults: "No drinks found.",
      categories: {
        hotDrinks: "Hot Drinks",
        coldDrinks: "Cold Drinks",
        frappe: "Frappe",
        otherDrinks: "Other Drinks",
        hot: "Hot",
        cold: "Cold",
      },
      actions: {
        edit: "Edit",
        delete: "Delete",
        deleting: "Deleting...",
        updating: "Updating...",
        markUnavailable: "Mark Unavailable",
        markAvailable: "Mark Available",
      },
      modal: {
        editTitle: "Edit Item",
        itemImage: "Item Image",
        imagePreviewAlt: "Edit item preview",
        category: "Category",
        name: "Name",
        namePlaceholder: "Item name",
        description: "Description",
        descriptionPlaceholder: "Description",
        price: "Price",
        cancel: "Cancel",
        saveChanges: "Save",
        saving: "Saving...",
      },
    },

    menuQR: {
      title: "Menu QR",
      subtitle: "Scan to order",
      loading: "Loading...",
      failedToLoadCafeInfo: "Failed to load café info",
      downloadQr: "Download QR",
      previewMenu: "Preview Menu",
      hint: "Place QR on tables.",
    },

    dashboard: {
      title: "Orders",
      liveUpdates: "Live updates",
      loadingOrders: "Loading...",
      retry: "Retry",
      updating: "Updating...",
      guestName: "Guest",
      unknownItem: "Unknown",
      failedToLoadProfile: "Failed",
      errorLoadingOrders: "Error",
      failedToUpdateStatus: "Update failed",
      newOrderNotificationTitle: "New Order",
      pendingAlert: (c: number) => `${c} new orders`,
      notifications: {
        enablePrompt: "Enable notifications",
        allow: "Allow",
      },
      columns: {
        newOrders: "New",
        preparing: "Preparing",
        completed: "Done",
      },
      empty: {
        newOrders: "None",
        preparing: "None",
        completed: "None",
      },
      actions: {
        startPreparing: "Start",
        markComplete: "Complete",
        completedPaid: "Done",
      },
    },

    menuAdd: {
      title: "Add Menu Item",
      subtitle: "Fill details",
      back: "Back to Menu",
      image: "Item Image",
      imagePreviewAlt: "Selected menu image preview",
      name: "Item Name",
      namePlaceholder: "e.g. Latte",
      description: "Description",
      descriptionPlaceholder: "Optional",
      price: "Price",
      available: "Available immediately",
      cancel: "Cancel",
      add: "Add Item",
      adding: "Adding...",
      errors: {
        nameRequired: "Name required",
        invalidPrice: "Invalid price",
        noCafe: "No café",
        failedAdd: "Failed to add",
      },
    },
  },

  km: {
    meta: { isKhmer: true },

    common: {
      loading: "កំពុងផ្ទុក...",
      signOut: "ចាកចេញ",
      language: "ភាសា",
      english: "ភាសាអង់គ្លេស",
      khmer: "ភាសាខ្មែរ",
      owner: "ម្ចាស់ហាង",
      dashboard: "ផ្ទាំងគ្រប់គ្រង",
    },

    nav: {
      orders: "ការបញ្ជាទិញ",
      analytics: "ការវិភាគ",
      menu: "ម៉ឺនុយ",
      qrCode: "កូដ QR",
    },

    ownerLayout: {
      toggleSidebar: "បិទ ឬ បើករបារចំហៀង",
    },

    orders: {
      title: "ការបញ្ជាទិញ",
      autoRefresh: "ធ្វើបច្ចុប្បន្នភាពដោយស្វ័យប្រវត្តិរៀងរាល់ 30 វិនាទី",
      updatedAt: "បានធ្វើបច្ចុប្បន្នភាព",
      refresh: "ផ្ទុកឡើងវិញ",
      loadingOrders: "កំពុងផ្ទុកការបញ្ជាទិញ...",
      emptyActive: "មិនមានការបញ្ជាទិញកំពុងដំណើរការទេ។",
      emptyAll: "មិនមានការបញ្ជាទិញទេ។",
      unknownItem: "មិនស្គាល់",
      updating: "កំពុងធ្វើបច្ចុប្បន្នភាព...",
      failedToLoadProfile: "បរាជ័យក្នុងការផ្ទុកប្រវត្តិរូប",
      errorLoadingOrders: "មានបញ្ហាក្នុងការផ្ទុកការបញ្ជាទិញ",
      failedToUpdateStatus: "បរាជ័យក្នុងការធ្វើបច្ចុប្បន្នភាពស្ថានភាព",
      pendingAlert: (c: number) => `មានការបញ្ជាទិញថ្មី ${c}`,
      filters: {
        active: "កំពុងដំណើរការ",
        completed: "បានបញ្ចប់",
        all: "ទាំងអស់",
      },
      kpi: {
        newOrders: "ការបញ្ជាទិញថ្មី",
        preparing: "កំពុងរៀបចំ",
        collected: "បានទទួល",
        totalToday: "សរុបថ្ងៃនេះ",
      },
      status: {
        pending: "ថ្មី",
        preparing: "កំពុងរៀបចំ",
        completed: "រួចរាល់",
      },
      actions: {
        startPreparing: "ចាប់ផ្តើម",
        markCompleted: "បញ្ចប់",
        completedPaid: "រួចរាល់",
      },
    },

    analytics: {
      loading: "កំពុងផ្ទុកទិន្នន័យវិភាគ...",
      failedToLoadProfile: "បរាជ័យក្នុងការផ្ទុកប្រវត្តិរូប",
      failedToLoadAnalytics: "បរាជ័យក្នុងការផ្ទុកទិន្នន័យវិភាគ",
      unknownItem: "មិនស្គាល់",
      period: {
        today: "ថ្ងៃនេះ",
        week: "៧ ថ្ងៃ",
        month: "៣០ ថ្ងៃ",
      },
      cards: {
        totalOrders: "ការបញ្ជាទិញសរុប",
        totalRevenue: "ចំណូលសរុប",
        avgOrderValue: "តម្លៃមធ្យមក្នុងមួយការបញ្ជាទិញ",
        peakHour: "ម៉ោងដែលមមាញឹកបំផុត",
      },
      sub: {
        selectedPeriod: "ក្នុងរយៈពេលដែលបានជ្រើស",
        completedOrdersOnly: "គិតតែការបញ្ជាទិញដែលបានបញ្ចប់",
        noData: "មិនមានទិន្នន័យ",
        noOrdersInPeriod: "មិនមានការបញ្ជាទិញក្នុងរយៈពេលនេះទេ",
        noOrdersYet: "មិនទាន់មានការបញ្ជាទិញទេ",
        totalOrders: "ការបញ្ជាទិញសរុប",
        darkerMoreOrders: "ពណ៌កាន់តែងងឹតមានន័យថាការបញ្ជាទិញកាន់តែច្រើន",
      },
      sections: {
        dailyRevenue: "ចំណូលប្រចាំថ្ងៃ",
        orderCompletion: "អត្រាបញ្ចប់ការបញ្ជាទិញ",
        popularDrink: "ភេសជ្ជៈពេញនិយម",
        recentOrders: "ការបញ្ជាទិញថ្មីៗ",
        busiestHours: "ម៉ោងដែលមមាញឹកបំផុត",
      },
      completion: {
        completed: "បានបញ្ចប់",
      },
      time: {
        am: "ព្រឹក",
        pm: "ល្ងាច",
      },
      units: {
        orders: "ការបញ្ជាទិញ",
      },
      empty: {
        noOrderData: "មិនទាន់មានទិន្នន័យ",
        noOrders: "មិនទាន់មានការបញ្ជាទិញ",
      },
    },

    menu: {
      title: "គ្រប់គ្រងម៉ឺនុយ",
      subtitle: "គ្រប់គ្រងម៉ឺនុយ",
      addNewItem: "បន្ថែម",
      loadingMenu: "កំពុងផ្ទុក...",
      emptyState: "គ្មានមុខម្ហូប",
      unavailable: "មិនមាន",
      noDescription: "គ្មានការពិពណ៌នា",
      generateQr: "បង្កើត QR",
      failedToLoadProfile: "បរាជ័យ",
      errorLoadingMenu: "មានបញ្ហា",
      failedToUpdateAvailability: "បរាជ័យ",
      failedToDeleteItem: "បរាជ័យ",
      failedToUpdateItem: "បរាជ័យ",
      confirmDelete: "លុបមែនទេ?",
      searchPlaceholder: "ស្វែងរកភេសជ្ជៈ...",
      noSearchResults: "រកមិនឃើញភេសជ្ជៈទេ។",
      categories: {
        hotDrinks: "ភេសជ្ជៈក្តៅ",
        coldDrinks: "ភេសជ្ជៈត្រជាក់",
        frappe: "ភេសជ្ជៈក្រឡុក",
        otherDrinks: "ភេសជ្ជៈផ្សេងៗ",
        hot: "ក្តៅ",
        cold: "ត្រជាក់",
      },
      actions: {
        edit: "កែ",
        delete: "លុប",
        deleting: "កំពុងលុប...",
        updating: "កំពុងអាប់ដេត...",
        markUnavailable: "មិនមាន",
        markAvailable: "មាន",
      },
      modal: {
        editTitle: "កែ",
        itemImage: "រូបភាព",
        imagePreviewAlt: "មើលរូបភាព",
        category: "ប្រភេទ",
        name: "ឈ្មោះ",
        namePlaceholder: "ឈ្មោះ",
        description: "ពិពណ៌នា",
        descriptionPlaceholder: "ពិពណ៌នា",
        price: "តម្លៃ",
        cancel: "បោះបង់",
        saveChanges: "រក្សា",
        saving: "កំពុងរក្សា...",
      },
    },

    menuQR: {
      title: "QR",
      subtitle: "ស្កេន",
      loading: "កំពុងផ្ទុក...",
      failedToLoadCafeInfo: "បរាជ័យ",
      downloadQr: "ទាញយក",
      previewMenu: "មើល",
      hint: "ដាក់លើតុ",
    },

    dashboard: {
      title: "ការបញ្ជាទិញ",
      liveUpdates: "ផ្ទាល់",
      loadingOrders: "កំពុងផ្ទុក...",
      retry: "សាកល្បង",
      updating: "កំពុងអាប់ដេត...",
      guestName: "ភ្ញៀវ",
      unknownItem: "មិនស្គាល់",
      failedToLoadProfile: "បរាជ័យ",
      errorLoadingOrders: "បញ្ហា",
      failedToUpdateStatus: "បរាជ័យ",
      newOrderNotificationTitle: "ថ្មី",
      pendingAlert: (c: number) => `${c} ថ្មី`,
      notifications: {
        enablePrompt: "បើក",
        allow: "អនុញ្ញាត",
      },
      columns: {
        newOrders: "ថ្មី",
        preparing: "រៀបចំ",
        completed: "រួច",
      },
      empty: {
        newOrders: "គ្មាន",
        preparing: "គ្មាន",
        completed: "គ្មាន",
      },
      actions: {
        startPreparing: "ចាប់ផ្តើម",
        markComplete: "បញ្ចប់",
        completedPaid: "រួច",
      },
    },

    menuAdd: {
      title: "បន្ថែមមុខម្ហូប",
      subtitle: "បំពេញ",
      back: "ត្រឡប់",
      image: "រូបភាព",
      imagePreviewAlt: "មើលរូបភាព",
      name: "ឈ្មោះ",
      namePlaceholder: "ឧ. កាហ្វេទឹកដោះគោ",
      description: "ពិពណ៌នា",
      descriptionPlaceholder: "ស្រេចចិត្ត",
      price: "តម្លៃ",
      available: "មានភ្លាមៗ",
      cancel: "បោះបង់",
      add: "បន្ថែម",
      adding: "កំពុងបន្ថែម...",
      errors: {
        nameRequired: "ត្រូវបញ្ចូលឈ្មោះ",
        invalidPrice: "តម្លៃមិនត្រឹមត្រូវ",
        noCafe: "រកមិនឃើញ",
        failedAdd: "បរាជ័យ",
      },
    },
  },
};

export function isLocale(value: string): value is Locale {
  return value === "en" || value === "km";
}