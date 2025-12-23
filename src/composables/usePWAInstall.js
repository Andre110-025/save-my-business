import { ref, onMounted, onUnmounted } from 'vue'

// 1. Move these OUTSIDE so they are global constants
const deferredPrompt = ref(null)
const canInstall = ref(false)
const isInstalled = ref(false)

// 2. This listener runs IMMEDIATELY when the script loads
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('🚨 GLOBAL EVENT CAPTURED')
  e.preventDefault()
  deferredPrompt.value = e
  canInstall.value = true
})

window.addEventListener('appinstalled', () => {
  console.log('🚀 PWA was installed successfully')
  canInstall.value = false
  isInstalled.value = true
})

export function usePWAInstall() {
  const checkIfInstalled = () => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isStandaloneIOS = window.navigator.standalone === true
    isInstalled.value = isStandalone || isStandaloneIOS
    return isInstalled.value
  }

  const installApp = async () => {
    if (!deferredPrompt.value) {
      showNativeInstructions()
      return
    }

    try {
      await deferredPrompt.value.prompt()
      const { outcome } = await deferredPrompt.value.userChoice
      if (outcome === 'accepted') {
        canInstall.value = false
        isInstalled.value = true
        deferredPrompt.value = null
      }
    } catch (error) {
      console.error('Install error:', error)
    }
  }

  const showNativeInstructions = () => {
    const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())
    if (isIOS) {
      alert('To install: Tap the "Share" icon (📤) and then "Add to Home Screen".')
    } else {
      alert('Tap the menu (⋮) and look for "Install app" or "Add to Home Screen".')
    }
  }

  onMounted(() => {
    checkIfInstalled()
    // We don't necessarily need to add the listener here anymore
    // because the global one above handles it for all components
  })

  // Return the GLOBAL refs
  return { canInstall, installApp, isInstalled }
}


// import { ref, onMounted, onUnmounted } from 'vue'

// export function usePWAInstall() {
//   const deferredPrompt = ref(null)
//   const canInstall = ref(false)
//   const isInstalled = ref(false)

//   // 1. Check if the app is already running as a PWA
//   const checkIfInstalled = () => {
//     const isStandalone = window.matchMedia('(display-mode: standalone)').matches
//     const isStandaloneIOS = window.navigator.standalone === true
    
//     isInstalled.value = isStandalone || isStandaloneIOS
//     return isInstalled.value
//   }

//   // 2. Capture the REAL browser prompt
//   const handleBeforeInstall = (e) => {
//     // Prevent the default mini-infobar from appearing
//     e.preventDefault()
//     // Stash the event so it can be triggered by your button
//     deferredPrompt.value = e
//     // Now show your "Install App" button
//     canInstall.value = true
    
//     console.log('✅ Real PWA Install Prompt captured')
//   }

//   // 3. The function that triggers the actual download/install
//   const installApp = async () => {
//     if (!deferredPrompt.value) {
//       // If the prompt isn't here, it's usually iOS or browser hasn't fired it yet
//       showNativeInstructions()
//       return
//     }

//     try {
//       // This line triggers the ACTUAL native browser download popup
//       await deferredPrompt.value.prompt()

//       // Wait for the user to click "Install" or "Cancel"
//       const { outcome } = await deferredPrompt.value.userChoice
//       console.log(`User response: ${outcome}`)

//       if (outcome === 'accepted') {
//         canInstall.value = false
//         isInstalled.value = true
//       }
      
//       // The prompt can only be used once, so clear it
//       deferredPrompt.value = null
//     } catch (error) {
//       console.error('Install error:', error)
//     }
//   }

//   const showNativeInstructions = () => {
//     const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())
//     if (isIOS) {
//       alert('To install: Tap the "Share" icon (📤) and then "Add to Home Screen".')
//     } else {
//       alert('Tap the menu (⋮) in top right look for "Install app" or "Add to Home Screen Follow the prompts to install' )
//     }
//   }

//   onMounted(() => {
//     checkIfInstalled()
//     window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    
//     // Also listen for the 'appinstalled' event
//     window.addEventListener('appinstalled', () => {
//       console.log('🚀 PWA was installed successfully')
//       canInstall.value = false
//       isInstalled.value = true
//     })
//   })

//   onUnmounted(() => {
//     window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
//   })

//   return { canInstall, installApp, isInstalled }
// }




// import { ref, onMounted, onUnmounted } from 'vue'

// export function usePWAInstall() {
//   const deferredPrompt = ref(null)
//   const canInstall = ref(false)
//   const isDevelopment = import.meta.env.DEV
//   const isInstalled = ref(false)

//   // Check if already installed as PWA
//   const checkIfInstalled = () => {
//     const standalone = window.matchMedia('(display-mode: standalone)').matches
//     const isStandaloneIOS = window.navigator.standalone === true
//     const hasAppReferrer = document.referrer.includes('android-app://')

//     isInstalled.value = standalone || isStandaloneIOS || hasAppReferrer

//     if (isInstalled.value) {
//       console.log('📱 App is already installed as PWA')
//       canInstall.value = false
//     }

//     return isInstalled.value
//   }

//   // Handle real beforeinstallprompt event
//   // const handleBeforeInstall = (e) => {
//   //   console.log('🎯 REAL beforeinstallprompt event fired!')
//   //   e.preventDefault()
//   //   deferredPrompt.value = e
//   //   canInstall.value = true
//   // }
//   const handleBeforeInstall = (e) => {
//     e.preventDefault()
//     deferredPrompt.value = e
//     canInstall.value = true

//     // Log the event object to see browser capabilities
//     console.log('🎯 Event Fired: beforeinstallprompt')
//     console.log('Platform details:', e.platforms) // Logs if it's 'web', 'play', etc.
//   }

//   // Create simulated prompt for development
//   const setupSimulatedPrompt = () => {
//     console.log('🔧 Setting up simulated PWA install for development')

//     // Track user engagement
//     let engagementTime = 0
//     let interactionCount = 0
//     const engagementTimer = setInterval(() => {
//       engagementTime += 1
//       // console.log(`Engagement: ${engagementTime}s, Interactions: ${interactionCount}`)
//     }, 1000)

//     // Track user interactions
//     const trackInteraction = () => {
//       interactionCount++
//       // console.log(`Interaction #${interactionCount}`)
//     }

//     document.addEventListener('click', trackInteraction)
//     document.addEventListener('scroll', trackInteraction)
//     document.addEventListener('keydown', trackInteraction)

//     // Simulate install prompt after meeting criteria OR force after delay
//     setTimeout(() => {
//       if (!checkIfInstalled() && !canInstall.value) {
//         console.log('🚀 Simulating PWA install availability')
//         canInstall.value = true

//         // Create realistic mock prompt
//         deferredPrompt.value = {
//           prompt: () => {
//             console.log('💡 Showing install dialog')

//             // Create a custom install dialog that looks native
//             return new Promise((resolve) => {
//               const dialog = document.createElement('div')
//               dialog.style.cssText = `
//                 position: fixed;
//                 top: 0;
//                 left: 0;
//                 right: 0;
//                 bottom: 0;
//                 background: rgba(0,0,0,0.5);
//                 display: flex;
//                 align-items: center;
//                 justify-content: center;
//                 z-index: 10000;
//                 font-family: system-ui, -apple-system, sans-serif;
//               `

//               dialog.innerHTML = `
//                 <div style="
//                   background: white;
//                   border-radius: 12px;
//                   padding: 24px;
//                   max-width: 400px;
//                   width: 90%;
//                   box-shadow: 0 10px 30px rgba(0,0,0,0.3);
//                   animation: slideUp 0.3s ease;
//                 ">
//                   <div style="display: flex; align-items: center; margin-bottom: 20px;">
//                     <div style="
//                       width: 48px;
//                       height: 48px;
//                       background: #05716c;
//                       border-radius: 12px;
//                       display: flex;
//                       align-items: center;
//                       justify-content: center;
//                       color: white;
//                       font-weight: bold;
//                       font-size: 20px;
//                       margin-right: 16px;
//                     ">SH</div>
//                     <div>
//                       <h3 style="margin: 0; font-weight: 600;">Install SMB</h3>
//                       <p style="margin: 4px 0 0; color: #666; font-size: 14px;">Management Dashboard</p>
//                     </div>
//                   </div>
                  
//                   <p style="color: #555; margin-bottom: 24px; line-height: 1.5;">
//                     Install this application on your device for easy access use.
//                   </p>
                  
//                   <div style="display: flex; gap: 12px; justify-content: flex-end;">
//                     <button id="cancelBtn" style="
//                       padding: 10px 20px;
//                       border: 1px solid #ddd;
//                       background: white;
//                       border-radius: 8px;
//                       color: #333;
//                       font-weight: 500;
//                       cursor: pointer;
//                     ">Cancel</button>
//                     <button id="installBtn" style="
//                       padding: 10px 20px;
//                       background: #05716c;
//                       color: white;
//                       border: none;
//                       border-radius: 8px;
//                       font-weight: 500;
//                       cursor: pointer;
//                     ">Install</button>
//                   </div>
//                 </div>
                
//                 <style>
//                   @keyframes slideUp {
//                     from { transform: translateY(20px); opacity: 0; }
//                     to { transform: translateY(0); opacity: 1; }
//                   }
//                 </style>
//               `

//               document.body.appendChild(dialog)

//               // Handle install button
//               dialog.querySelector('#installBtn').addEventListener('click', () => {
//                 document.body.removeChild(dialog)
//                 console.log('✅ User accepted installation')
//                 resolve({ outcome: 'accepted' })

//                 // In real PWA, this would trigger download
//                 // For simulation, we'll show success message
//                 setTimeout(() => {
//                   alert(
//                     '✅ Installation simulated successfully!\n\nIn production, the app would now install like a native app.',
//                   )
//                   canInstall.value = false
//                   deferredPrompt.value = null
//                 }, 500)
//               })

//               // Handle cancel button
//               dialog.querySelector('#cancelBtn').addEventListener('click', () => {
//                 document.body.removeChild(dialog)
//                 console.log('❌ User cancelled installation')
//                 resolve({ outcome: 'dismissed' })
//               })

//               // Close on background click
//               dialog.addEventListener('click', (e) => {
//                 if (e.target === dialog) {
//                   document.body.removeChild(dialog)
//                   resolve({ outcome: 'dismissed' })
//                 }
//               })
//             })
//           },

//           userChoice: new Promise((resolve) => {
//             // This would normally be set by the browser
//             // We'll resolve when prompt() is called
//             setTimeout(() => resolve({ outcome: 'accepted' }), 100)
//           }),
//         }
//       }

//       // Cleanup
//       clearInterval(engagementTimer)
//       document.removeEventListener('click', trackInteraction)
//       document.removeEventListener('scroll', trackInteraction)
//       document.removeEventListener('keydown', trackInteraction)
//     }, 3000) // Show install button after 3 seconds (for testing)
//   }

//   onMounted(() => {
//     // Check if already installed
//     checkIfInstalled()

//     // Listen for real install prompt (production)
//     window.addEventListener('beforeinstallprompt', handleBeforeInstall)

//     // In development, simulate the experience
//     if (isDevelopment && !isInstalled.value) {
//       setupSimulatedPrompt()
//     }
//   })

//   onUnmounted(() => {
//     window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
//   })

//   const installApp = async () => {
//     if (!deferredPrompt.value) {
//       console.log(
//         "❌ Browser Response: Prompt not ready. The 'beforeinstallprompt' hasn't fired yet.",
//       )
//       return
//     }

//     try {
//       // Show the native popup
//       deferredPrompt.value.prompt()

//       // Log the response from the browser/user
//       const choiceResult = await deferredPrompt.value.userChoice

//       if (choiceResult.outcome === 'accepted') {
//         console.log('✅ Browser Response: User accepted the install')
//       } else {
//         console.log('🧡 Browser Response: User dismissed/cancelled the install')
//       }

//       // Clear the prompt
//       deferredPrompt.value = null
//       canInstall.value = false
//     } catch (err) {
//       console.error('⚠️ Browser Response Error:', err)
//     }
//   }

//   // const installApp = async () => {
//   //   console.log('🚀 Install App clicked')

//   //   if (isInstalled.value) {
//   //     alert('📱 App is already installed!')
//   //     return
//   //   }

//   //   if (!deferredPrompt.value) {
//   //     console.warn('No install prompt available')
//   //     showNativeInstructions()
//   //     return
//   //   }

//   //   try {
//   //     console.log('Triggering install...')
//   //     await deferredPrompt.value.prompt()
//   //     const choiceResult = await deferredPrompt.value.userChoice

//   //     console.log('User choice:', choiceResult.outcome)
//   //     if (choiceResult.outcome === 'accepted') {
//   //       console.log('✅ Installation accepted')
//   //       canInstall.value = false
//   //       isInstalled.value = true
//   //     }
//   //   } catch (error) {
//   //     console.error('Install error:', error)
//   //     showNativeInstructions()
//   //   }
//   // }

//   const showNativeInstructions = () => {
//     const userAgent = navigator.userAgent.toLowerCase()
//     const isIOS = /iphone|ipad|ipod/.test(userAgent) && !window.MSStream
//     const isAndroid = /android/.test(userAgent)
//     const isChrome = /chrome/.test(userAgent) && !/edge/.test(userAgent)
//     const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent)

//     let instructions = '📱 Install StoreHive\n\n'

//     if (isIOS) {
//       if (isSafari) {
//         instructions += 'Safari on iOS:\n'
//         instructions += '1. Tap the Share button (📤) at the bottom\n'
//         instructions += '2. Scroll down and tap "Add to Home Screen"\n'
//         instructions += '3. Tap "Add" in the top right\n'
//       } else {
//         instructions += 'Other browsers on iOS may not support PWA installation.\n'
//         instructions += 'Try opening in Safari and following the steps above.'
//       }
//     } else if (isAndroid) {
//       if (isChrome) {
//         instructions += 'Chrome on Android:\n'
//         instructions += '1. Tap the menu (⋮) in top right\n'
//         instructions += '2. Tap "Install app" or "Add to Home Screen"\n'
//         instructions += '3. Follow the prompts to install\n'
//         instructions += '\nNote: Chrome may require you to use the site for 30+ seconds first.'
//       } else {
//         instructions += 'For other Android browsers, look for:\n'
//         instructions += '• "Add to Home Screen" in menu\n'
//         instructions += '• "Install" option\n'
//         instructions += '• Three-dot menu → More tools'
//       }
//     } else {
//       // Desktop
//       instructions += 'On Desktop:\n'
//       if (isChrome) {
//         instructions += '1. Look for the install icon (⬇️) in address bar\n'
//         instructions += '2. Or click the puzzle piece icon → "Install StoreHive"\n'
//         instructions += '\nChrome requires: 30+ seconds of interaction, visited 2+ times'
//       } else if (isSafari) {
//         instructions += 'Safari: File → "Add to Dock" (macOS)'
//       } else {
//         instructions += 'Check your browser\'s menu for "Install" or "Add to Home Screen"'
//       }
//     }

//     alert(instructions)
//   }

//   return {
//     canInstall,
//     installApp,
//     isInstalled,
//     // Optional: Add method to check PWA criteria
//     checkPWAStatus: () => {
//       const criteria = {
//         https: window.isSecureContext,
//         hasManifest: !!document.querySelector('link[rel="manifest"]'),
//         hasServiceWorker: 'serviceWorker' in navigator,
//         isStandalone: window.matchMedia('(display-mode: standalone)').matches,
//         userAgent: navigator.userAgent,
//       }
//       console.log('PWA Criteria:', criteria)
//       return criteria
//     },
//   }
// }
