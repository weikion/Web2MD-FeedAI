/**
 * CopyToMD Background Service Worker (Manifest V3)
 */

// Enable open side panel when clicking the extension action icon
chrome.runtime.onInstalled.addListener(() => {
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((err) => {
      console.warn('sidePanel.setPanelBehavior not supported or error:', err);
    });
  }

  // Create Context Menus
  chrome.contextMenus.create({
    id: 'copy-selection-md',
    title: '转换为 Markdown 并打开侧边栏',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'convert-page-md',
    title: '转换整页正文为 Markdown',
    contexts: ['page']
  });

  chrome.contextMenus.create({
    id: 'open-sidepanel',
    title: '打开 Web2MD-FeedAI 侧边栏',
    contexts: ['all']
  });
});

// Handle Context Menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab || !tab.id) return;

  if (info.menuItemId === 'open-sidepanel') {
    await openSidePanel(tab.id);
  } else if (info.menuItemId === 'copy-selection-md') {
    await openSidePanel(tab.id);
    chrome.tabs.sendMessage(tab.id, { type: 'TRIGGER_SELECTION_CONVERT' }).catch(() => {});
  } else if (info.menuItemId === 'convert-page-md') {
    await openSidePanel(tab.id);
    chrome.tabs.sendMessage(tab.id, { type: 'TRIGGER_PAGE_CONVERT' }).catch(() => {});
  }
});

// Helper to open side panel safely
async function openSidePanel(tabId) {
  try {
    if (chrome.sidePanel && chrome.sidePanel.open) {
      await chrome.sidePanel.open({ tabId });
    }
  } catch (err) {
    console.warn('Failed to open sidePanel:', err);
  }
}

// Track active sidepanel connections per window: windowId -> port
const sidepanelPorts = new Map();

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'sidepanel-connection') {
    let attachedWindowId = null;

    port.onMessage.addListener((msg) => {
      if (msg.type === 'REGISTER_SIDEPANEL_WINDOW' && msg.windowId != null) {
        attachedWindowId = msg.windowId;
        sidepanelPorts.set(attachedWindowId, port);
      }
    });

    port.onDisconnect.addListener(() => {
      if (attachedWindowId != null) {
        sidepanelPorts.delete(attachedWindowId);
      }
    });
  }
});

// Handle messages from content script or sidepanel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'OPEN_SIDEPANEL') {
    const tabId = sender.tab ? sender.tab.id : undefined;
    if (tabId) {
      openSidePanel(tabId).then(() => sendResponse({ success: true }));
      return true;
    }
  }

  if (message.type === 'HANDLE_SELECTION_CHANGE') {
    const windowId = sender.tab ? sender.tab.windowId : null;
    if (windowId != null && sidepanelPorts.has(windowId)) {
      const port = sidepanelPorts.get(windowId);
      try {
        const payload = {
          ...message.data,
          title: (sender.tab && sender.tab.title) || message.data.title,
          url: (sender.tab && sender.tab.url) || message.data.url
        };
        port.postMessage({
          type: 'SYNC_SELECTION',
          data: payload
        });
        sendResponse({ handled: true });
      } catch (err) {
        sidepanelPorts.delete(windowId);
        sendResponse({ handled: false });
      }
    } else {
      sendResponse({ handled: false });
    }
    return true;
  }
});

