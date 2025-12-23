<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

export function usePWAInstall() {
  const deferredPrompt = ref(null)
  const canInstall = ref(false)
  const isInstalled = ref(false)

  // 1. Check if the app is already running as a PWA
  const checkIfInstalled = () => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isStandaloneIOS = window.navigator.standalone === true
    
    isInstalled.value = isStandalone || isStandaloneIOS
    return isInstalled.value
  }

  // 2. Capture the REAL browser prompt
  const handleBeforeInstall = (e) => {
    // Prevent the default mini-infobar from appearing
    e.preventDefault()
    // Stash the event so it can be triggered by your button
    deferredPrompt.value = e
    // Now show your "Install App" button
    canInstall.value = true
    
    console.log('✅ Real PWA Install Prompt captured')
  }

  // 3. The function that triggers the actual download/install
  const installApp = async () => {
    if (!deferredPrompt.value) {
      // If the prompt isn't here, it's usually iOS or browser hasn't fired it yet
      showNativeInstructions()
      return
    }

    try {
      // This line triggers the ACTUAL native browser download popup
      await deferredPrompt.value.prompt()

      // Wait for the user to click "Install" or "Cancel"
      const { outcome } = await deferredPrompt.value.userChoice
      console.log(`User response: ${outcome}`)

      if (outcome === 'accepted') {
        canInstall.value = false
        isInstalled.value = true
      }
      
      // The prompt can only be used once, so clear it
      deferredPrompt.value = null
    } catch (error) {
      console.error('Install error:', error)
    }
  }

  const showNativeInstructions = () => {
    const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())
    if (isIOS) {
      alert('To install: Tap the "Share" icon (📤) and then "Add to Home Screen".')
    } else {
      alert('Please use the 3-dot menu in your browser and select "Install App".')
    }
  }

  onMounted(() => {
    checkIfInstalled()
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    
    // Also listen for the 'appinstalled' event
    window.addEventListener('appinstalled', () => {
      console.log('🚀 PWA was installed successfully')
      canInstall.value = false
      isInstalled.value = true
    })
  })

  onUnmounted(() => {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
  })

  return { canInstall, installApp, isInstalled }
}







// usePWAInstall.js - Updated with auto-prompt functionality
import { ref, onMounted, onUnmounted, computed } from 'vue'

export function usePWAInstall() {
  const deferredPrompt = ref(null)
  const canInstall = ref(false)
  const isDevelopment = import.meta.env.DEV
  const isInstalled = ref(false)
  const showPrompt = ref(false)
  
  // Engagement tracking
  const engagementTime = ref(0)
  const pageViews = ref(1) // Start with 1
  const userInteractions = ref(0)
  
  // Auto-show prompt based on engagement
  const shouldAutoShow = computed(() => {
    // Don't auto-show if already installed or already prompted
    if (isInstalled.value || localStorage.getItem('pwa_prompt_shown')) {
      return false
    }
    
    // Check engagement criteria
    const hasEngagement = engagementTime.value > 30 && userInteractions.value > 3
    const hasMultipleVisits = parseInt(localStorage.getItem('pwa_visit_count') || '1') >= 2
    
    return hasEngagement || hasMultipleVisits
  })

  // Track visit count
  const trackVisit = () => {
    const today = new Date().toDateString()
    const lastVisit = localStorage.getItem('pwa_last_visit')
    
    if (lastVisit !== today) {
      const count = parseInt(localStorage.getItem('pwa_visit_count') || '0') + 1
      localStorage.setItem('pwa_visit_count', count.toString())
      localStorage.setItem('pwa_last_visit', today)
      pageViews.value = count
    }
  }

  // Check if already installed as PWA
  const checkIfInstalled = () => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    const isStandaloneIOS = window.navigator.standalone === true
    const hasAppReferrer = document.referrer.includes('android-app://')
    
    // Check for Web App Capabilities API (modern PWAs)
    if ('windowControlsOverlay' in navigator || 
        'standalone' in window.navigator || 
        'getInstalledRelatedApps' in navigator) {
      isInstalled.value = standalone || isStandaloneIOS || hasAppReferrer
    } else {
      // Fallback to traditional detection
      isInstalled.value = standalone || isStandaloneIOS || hasAppReferrer || 
                          window.matchMedia('(display-mode: fullscreen)').matches ||
                          window.matchMedia('(display-mode: minimal-ui)').matches
    }

    if (isInstalled.value) {
      console.log('📱 App is already installed as PWA')
      canInstall.value = false
      localStorage.setItem('pwa_installed', 'true')
    }

    return isInstalled.value
  }

  // Handle real beforeinstallprompt event
  const handleBeforeInstall = (e) => {
    console.log('🎯 REAL beforeinstallprompt event fired!')
    e.preventDefault()
    deferredPrompt.value = e
    canInstall.value = true
    
    // Auto-show the install prompt if user meets criteria
    if (shouldAutoShow.value) {
      setTimeout(() => {
        showInstallPrompt()
      }, 1000) // Small delay for better UX
    }
  }

  // Auto-show install prompt based on engagement
  const checkAndAutoPrompt = () => {
    if (canInstall.value && shouldAutoShow.value && !showPrompt.value) {
      console.log('🔔 Auto-showing install prompt based on engagement')
      showInstallPrompt()
      localStorage.setItem('pwa_prompt_shown', 'true')
    }
  }

  // Show install prompt (can be called automatically or manually)
  const showInstallPrompt = () => {
    if (!canInstall.value || isInstalled.value) {
      return
    }
    
    showPrompt.value = true
    
    // Create and show a custom install dialog
    const dialog = createInstallDialog()
    document.body.appendChild(dialog)
    
    // Add animation class
    setTimeout(() => {
      dialog.classList.add('show')
    }, 10)
  }

  // Create install dialog
  const createInstallDialog = () => {
    const dialog = document.createElement('div')
    dialog.className = 'pwa-install-dialog'
    dialog.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: flex-end;
      justify-content: center;
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    `
    
    dialog.innerHTML = `
      <div class="pwa-install-content" style="
        background: white;
        border-radius: 20px 20px 0 0;
        padding: 30px 24px 24px;
        width: 100%;
        max-width: 500px;
        box-shadow: 0 -10px 40px rgba(0,0,0,0.2);
        transform: translateY(100%);
        transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1);
      ">
        <div style="position: absolute; top: 16px; right: 16px;">
          <button class="close-btn" style="
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #999;
            padding: 4px 8px;
          ">✕</button>
        </div>
        
        <div style="display: flex; align-items: center; margin-bottom: 20px;">
          <div style="
            width: 64px;
            height: 64px;
            background: linear-gradient(135deg, #05716c, #089f9a);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 24px;
            margin-right: 16px;
            box-shadow: 0 4px 12px rgba(5, 113, 108, 0.3);
          ">SH</div>
          <div>
            <h3 style="margin: 0; font-weight: 600; font-size: 20px;">Install StoreHive</h3>
            <p style="margin: 6px 0 0; color: #666; font-size: 14px;">Enhanced experience & offline access</p>
          </div>
        </div>

        <div style="margin-bottom: 24px;">
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <span style="color: #05716c; margin-right: 8px;">✓</span>
            <span style="font-size: 14px;">Work offline</span>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <span style="color: #05716c; margin-right: 8px;">✓</span>
            <span style="font-size: 14px;">Fast loading</span>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <span style="color: #05716c; margin-right: 8px;">✓</span>
            <span style="font-size: 14px;">Home screen access</span>
          </div>
          <div style="display: flex; align-items: center;">
            <span style="color: #05716c; margin-right: 8px;">✓</span>
            <span style="font-size: 14px;">Push notifications</span>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          <button id="installBtn" style="
            padding: 16px;
            background: linear-gradient(135deg, #05716c, #089f9a);
            color: white;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
          ">Install Now</button>
          
          <button id="laterBtn" style="
            padding: 16px;
            background: transparent;
            color: #666;
            border: 1px solid #ddd;
            border-radius: 12px;
            font-weight: 500;
            font-size: 16px;
            cursor: pointer;
          ">Maybe Later</button>
        </div>
      </div>
    `

    // Show dialog with animation
    setTimeout(() => {
      dialog.style.opacity = '1'
      dialog.style.pointerEvents = 'all'
      const content = dialog.querySelector('.pwa-install-content')
      content.style.transform = 'translateY(0)'
    }, 10)

    // Handle install button
    dialog.querySelector('#installBtn').addEventListener('click', async () => {
      await installApp()
      hideDialog(dialog)
    })

    // Handle close and later buttons
    const hideDialog = (d) => {
      const content = d.querySelector('.pwa-install-content')
      content.style.transform = 'translateY(100%)'
      d.style.opacity = '0'
      
      setTimeout(() => {
        if (document.body.contains(d)) {
          document.body.removeChild(d)
        }
        showPrompt.value = false
      }, 400)
    }

    dialog.querySelector('.close-btn').addEventListener('click', () => {
      localStorage.setItem('pwa_prompt_dismissed', Date.now().toString())
      hideDialog(dialog)
    })

    dialog.querySelector('#laterBtn').addEventListener('click', () => {
      // Don't show again for 7 days
      const weekFromNow = Date.now() + (7 * 24 * 60 * 60 * 1000)
      localStorage.setItem('pwa_prompt_dismissed', weekFromNow.toString())
      hideDialog(dialog)
    })

    // Close on background click
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) {
        hideDialog(dialog)
      }
    })

    return dialog
  }

  // Install app function
  const installApp = async () => {
    console.log('🚀 Install App triggered')
    
    if (isInstalled.value) {
      alert('📱 App is already installed!')
      return
    }

    if (!deferredPrompt.value) {
      console.warn('No install prompt available')
      showNativeInstructions()
      return
    }

    try {
      console.log('Triggering install prompt...')
      deferredPrompt.value.prompt()
      
      const choiceResult = await deferredPrompt.value.userChoice
      
      console.log('User choice:', choiceResult.outcome)
      if (choiceResult.outcome === 'accepted') {
        console.log('✅ Installation accepted')
        canInstall.value = false
        isInstalled.value = true
        localStorage.setItem('pwa_installed', 'true')
        
        // Show success message
        showInstallSuccess()
      } else {
        console.log('❌ Installation dismissed')
        // Schedule to show again in 3 days
        localStorage.setItem('pwa_prompt_dismissed', 
          (Date.now() + (3 * 24 * 60 * 60 * 1000)).toString()
        )
      }
      
      deferredPrompt.value = null
    } catch (error) {
      console.error('Install error:', error)
      showNativeInstructions()
    }
  }

  // Show installation success message
  const showInstallSuccess = () => {
    const success = document.createElement('div')
    success.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
      z-index: 10001;
      animation: slideIn 0.3s ease;
      font-family: system-ui, -apple-system, sans-serif;
    `
    
    success.innerHTML = `
      <div style="display: flex; align-items: center;">
        <span style="font-size: 20px; margin-right: 12px;">🎉</span>
        <div>
          <strong style="display: block;">Installation Started!</strong>
          <small style="opacity: 0.9;">Check your home screen</small>
        </div>
      </div>
    `
    
    document.body.appendChild(success)
    
    setTimeout(() => {
      if (document.body.contains(success)) {
        document.body.removeChild(success)
      }
    }, 3000)
  }

  // Engagement tracking setup
  let engagementInterval
  const setupEngagementTracking = () => {
    // Start engagement timer
    engagementInterval = setInterval(() => {
      engagementTime.value++
      
      // Check if we should auto-prompt every 10 seconds
      if (engagementTime.value % 10 === 0) {
        checkAndAutoPrompt()
      }
    }, 1000)

    // Track interactions
    const trackInteraction = () => {
      userInteractions.value++
    }

    document.addEventListener('click', trackInteraction, { passive: true })
    document.addEventListener('scroll', trackInteraction, { passive: true })
    document.addEventListener('keydown', trackInteraction, { passive: true })

    return () => {
      clearInterval(engagementInterval)
      document.removeEventListener('click', trackInteraction)
      document.removeEventListener('scroll', trackInteraction)
      document.removeEventListener('keydown', trackInteraction)
    }
  }

  // Development simulation
  const setupSimulatedPrompt = () => {
    console.log('🔧 Setting up simulated PWA install for development')
    
    // Simulate install prompt after engagement
    setTimeout(() => {
      if (!checkIfInstalled()) {
        console.log('🚀 Simulating PWA install availability')
        canInstall.value = true
        
        // Create realistic mock prompt
        deferredPrompt.value = {
          prompt: () => {
            console.log('💡 Showing simulated install dialog')
            return Promise.resolve({ outcome: 'accepted' })
          },
          userChoice: Promise.resolve({ outcome: 'accepted' })
        }
        
        // Auto-show after simulation
        setTimeout(() => {
          showInstallPrompt()
        }, 1000)
      }
    }, 2000) // Shorter delay for development
    
    setupEngagementTracking()
  }

  onMounted(() => {
    // Track visit
    trackVisit()
    
    // Check if already installed
    checkIfInstalled()
    
    // Check if we shouldn't show prompt (recent dismissal)
    const lastDismissal = localStorage.getItem('pwa_prompt_dismissed')
    if (lastDismissal && Date.now() < parseInt(lastDismissal)) {
      console.log('⏸️ Skipping auto-prompt (recently dismissed)')
    }
    
    // Listen for real install prompt
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    
    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      console.log('🎉 PWA was installed')
      isInstalled.value = true
      canInstall.value = false
      localStorage.setItem('pwa_installed', 'true')
    })
    
    // Setup engagement tracking
    if (isDevelopment && !isInstalled.value) {
      setupSimulatedPrompt()
    } else if (!isInstalled.value) {
      setupEngagementTracking()
    }
  })

  onUnmounted(() => {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    window.removeEventListener('appinstalled', () => {})
    
    if (engagementInterval) {
      clearInterval(engagementInterval)
    }
  })

  // Keep your existing showNativeInstructions function...

  return {
    canInstall,
    installApp,
    isInstalled,
    showInstallPrompt, // Export to allow manual triggering
    engagementTime,
    userInteractions,
    pageViews
  }
}
































import { ref, onMounted, onUnmounted, computed } from 'vue'

export function usePWAInstall() {
  const deferredPrompt = ref(null) // this stores the beforeinstall prompt, like a simulation
  const canInstall = ref(false)  // checking if install flow is available
  const isDevelopment = import.meta.env.DEV // this enables a simulation in dev
  const isInstalled = ref(false)
  const showPrompt = ref(false)

  // Check if already installed as PWA
  const checkIfInstalled = () => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    const isStandaloneIOS = window.navigator.standalone === true //IOS
    const hasAppReferrer = document.referrer.includes('android-app://') //andriod

    isInstalled.value = standalone || isStandaloneIOS || hasAppReferrer

    if (isInstalled.value) {
      console.log('📱 App is already installed as PWA')
      canInstall.value = false
    }

    return isInstalled.value
  }

  // Handle real beforeinstallprompt event
  const handleBeforeInstall = (e) => {
    console.log('🎯 REAL beforeinstallprompt event fired!')
    e.preventDefault()
    deferredPrompt.value = e //  to keep control, stores the event
    canInstall.value = true
  }

  // Create simulated prompt for development
  const setupSimulatedPrompt = () => {
    console.log('🔧 Setting up simulated PWA install for development')

    // Track user engagement
    let engagementTime = 0
    let interactionCount = 0
    const engagementTimer = setInterval(() => {
      engagementTime += 1
      // console.log(`Engagement: ${engagementTime}s, Interactions: ${interactionCount}`)
    }, 1000)

    // Track user interactions
    const trackInteraction = () => {
      interactionCount++
      // console.log(`Interaction #${interactionCount}`)
    }

    document.addEventListener('click', trackInteraction)
    document.addEventListener('scroll', trackInteraction)
    document.addEventListener('keydown', trackInteraction)

    // Simulate install prompt after meeting criteria OR force after delay
    setTimeout(() => {
      if (!checkIfInstalled() && !canInstall.value) {
        console.log('🚀 Simulating PWA install availability')
        canInstall.value = true

        // Create realistic mock prompt
        deferredPrompt.value = {
          prompt: () => {
            console.log('💡 Showing install dialog')

            // Create a custom install dialog that looks native
            return new Promise((resolve) => {
              const dialog = document.createElement('div')
              dialog.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                font-family: system-ui, -apple-system, sans-serif;
              `

              dialog.innerHTML = `
                <div style="
                  background: white;
                  border-radius: 12px;
                  padding: 24px;
                  max-width: 400px;
                  width: 90%;
                  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                  animation: slideUp 0.3s ease;
                ">
                  <div style="display: flex; align-items: center; margin-bottom: 20px;">
                    <div style="
                      width: 48px;
                      height: 48px;
                      background: #05716c;
                      border-radius: 12px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      color: white;
                      font-weight: bold;
                      font-size: 20px;
                      margin-right: 16px;
                    ">SH</div>
                    <div>
                      <h3 style="margin: 0; font-weight: 600;">Install StoreHive</h3>
                      <p style="margin: 4px 0 0; color: #666; font-size: 14px;">Pharmacy Management Dashboard</p>
                    </div>
                  </div>

                  <p style="color: #555; margin-bottom: 24px; line-height: 1.5;">
                    Install this application on your device for easy access and offline use.
                  </p>

                  <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button id="cancelBtn" style="
                      padding: 10px 20px;
                      border: 1px solid #ddd;
                      background: white;
                      border-radius: 8px;
                      color: #333;
                      font-weight: 500;
                      cursor: pointer;
                    ">Cancel</button>
                    <button id="installBtn" style="
                      padding: 10px 20px;
                      background: #05716c;
                      color: white;
                      border: none;
                      border-radius: 8px;
                      font-weight: 500;
                      cursor: pointer;
                    ">Install</button>
                  </div>
                </div>

                <style>
                  @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                  }
                </style>
              `

              document.body.appendChild(dialog)

              // Handle install button
              dialog.querySelector('#installBtn').addEventListener('click', () => {
                document.body.removeChild(dialog)
                console.log('✅ User accepted installation')
                resolve({ outcome: 'accepted' })

                // In real PWA, this would trigger download
                // For simulation, we'll show success message
                setTimeout(() => {
                  alert('✅ Installation simulated successfully!\n\nIn production, the app would now install like a native app.')
                  canInstall.value = false
                  deferredPrompt.value = null
                }, 500)
              })

              // Handle cancel button
              dialog.querySelector('#cancelBtn').addEventListener('click', () => {
                document.body.removeChild(dialog)
                console.log('❌ User cancelled installation')
                resolve({ outcome: 'dismissed' })
              })

              // Close on background click
              dialog.addEventListener('click', (e) => {
                if (e.target === dialog) {
                  document.body.removeChild(dialog)
                  resolve({ outcome: 'dismissed' })
                }
              })
            })
          },

          userChoice: new Promise((resolve) => {
            // This would normally be set by the browser
            // We'll resolve when prompt() is called
            setTimeout(() => resolve({ outcome: 'accepted' }), 100)
          })
        }
      }

      // Cleanup
      clearInterval(engagementTimer)
      document.removeEventListener('click', trackInteraction)
      document.removeEventListener('scroll', trackInteraction)
      document.removeEventListener('keydown', trackInteraction)

    }, 3000) // Show install button after 3 seconds (for testing)
  }

  onMounted(() => {
    // Check if already installed
    checkIfInstalled()

    // Listen for real install prompt (production)
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    // In development, simulate the experience
    if (isDevelopment && !isInstalled.value) {
      setupSimulatedPrompt()
    }
  })

  onUnmounted(() => {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
  })

  const installApp = async () => {
    console.log('🚀 Install App clicked')

    if (isInstalled.value) {
      alert('📱 App is already installed!')
      return
    }

    if (!deferredPrompt.value) {
      console.warn('No install prompt available')
      showNativeInstructions()
      return
    }

    try {
      console.log('Triggering install...')
      await deferredPrompt.value.prompt()
      const choiceResult = await deferredPrompt.value.userChoice

      console.log('User choice:', choiceResult.outcome)
      if (choiceResult.outcome === 'accepted') {
        console.log('✅ Installation accepted')
        canInstall.value = false
        isInstalled.value = true
      }
    } catch (error) {
      console.error('Install error:', error)
      showNativeInstructions()
    }
  }

  // instructions
  const showNativeInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase()
    const isIOS = /iphone|ipad|ipod/.test(userAgent) && !window.MSStream
    const isAndroid = /android/.test(userAgent)
    const isChrome = /chrome/.test(userAgent) && !/edge/.test(userAgent)
    const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent)

    let instructions = '📱 Install StoreHive\n\n'

    if (isIOS) {
      if (isSafari) {
        instructions += 'Safari on iOS:\n'
        instructions += '1. Tap the Share button (📤) at the bottom\n'
        instructions += '2. Scroll down and tap "Add to Home Screen"\n'
        instructions += '3. Tap "Add" in the top right\n'
      } else {
        instructions += 'Other browsers on iOS may not support PWA installation.\n'
        instructions += 'Try opening in Safari and following the steps above.'
      }
    } else if (isAndroid) {
      if (isChrome) {
        instructions += 'Chrome on Android:\n'
        instructions += '1. Tap the menu (⋮) in top right\n'
        instructions += '2. Tap "Install app" or "Add to Home Screen"\n'
        instructions += '3. Follow the prompts to install\n'
        instructions += '\nNote: Chrome may require you to use the site for 30+ seconds first.'
      } else {
        instructions += 'For other Android browsers, look for:\n'
        instructions += '• "Add to Home Screen" in menu\n'
        instructions += '• "Install" option\n'
        instructions += '• Three-dot menu → More tools'
      }
    } else {
      // Desktop
      instructions += 'On Desktop:\n'
      if (isChrome) {
        instructions += '1. Look for the install icon (⬇️) in address bar\n'
        instructions += '2. Or click the puzzle piece icon → "Install StoreHive"\n'
        instructions += '\nChrome requires: 30+ seconds of interaction, visited 2+ times'
      } else if (isSafari) {
        instructions += 'Safari: File → "Add to Dock" (macOS)'
      } else {
        instructions += 'Check your browser\'s menu for "Install" or "Add to Home Screen"'
      }
    }

     alert(instructions)
  }

  return {
    canInstall,
    installApp,
    isInstalled,
    // Optional: Add method to check PWA criteria
    checkPWAStatus: () => {
      const criteria = {
        https: window.isSecureContext,
        hasManifest: !!document.querySelector('link[rel="manifest"]'),
        hasServiceWorker: 'serviceWorker' in navigator,
        isStandalone: window.matchMedia('(display-mode: standalone)').matches,
        userAgent: navigator.userAgent
      }
      console.log('PWA Criteria:', criteria)
      return criteria
    }
  }
}

</script>

<template>
  <VueFinalModal
    class="flex h-full w-full items-center justify-center"
    content-class="relative bg-white border w-full h-[600px] max-w-[940px] rounded-2xl shadow-lg max-[450px]:h-full max-[450px]:max-w-full max-[450px]:rounded-none"
    overlay-class="bg-black/50 backdrop-blur-sm"
    :overlayTransition="'vfm-fade'"
    :contentTransition="'vfm-fade'"
    :clickToClose="true"
  >
    <div class="flex w-full h-full max-[450px]:flex-col">
      <!-- FIRST VIEW: Product Selection + Receipt -->
      <div v-if="currentView === 'first'" class="flex w-full h-full max-[450px]:flex-col">
        <!-- Product Search Section -->
        <div class="flex-1 flex flex-col p-6 max-[450px]:p-4 max-[450px]:pb-0">
          <div class="flex flex-row items-start gap-4 max-[450px]:gap-2">
            <div
              class="mt-1.5 w-10 h-10 bg-[rgba(5,113,108,0.1)] rounded-sm flex items-center justify-center max-[450px]:w-8 max-[450px]:h-8 max-[450px]:mt-0.5"
            >
              <IconCheckCertificate color="#05716c" class="max-[450px]:w-5 max-[450px]:h-5" />
            </div>
            <div class="flex flex-col justify-center">
              <h2 class="text-lg font-semibold max-[450px]:text-base">Make a Sale</h2>
              <p class="text-gray-600 max-[450px]:text-sm">Select from your stock to make sales easily.</p>
            </div>
          </div>

          <ProductSearch
            :userType="user.userType"
            :userBranch="user.branchId"
            @select-product="initializeSelected"
          />
        </div>

        <!-- Receipt View Section -->
        <div class="bg-[#f7f8fa] flex-1 p-5 rounded-tr-2xl rounded-br-2xl max-[450px]:p-4 max-[450px]:rounded-none max-[450px]:border-t max-[450px]:border-gray-200">
          <ReceiptView
            :selectedItems="selectedSale"
            :currentTime="currentTime"
            :initialTaxEnabled="false"
            @close="emits('confirm')"
            @delete-item="deleteSelect"
            @update-tax="updateTax"
          />

          <button
            @click="goToCustomerSomething"
            class="mt-2.5 w-full mainBtn transition duration-300"
            type="submit"
          >
            Complete Sale
          </button>
        </div>
      </div>

      <!-- SECOND VIEW: Customer Selection + Payment -->
      <div v-if="currentView === 'second'" class="flex w-full h-full max-[450px]:flex-col-reverse">
        <!-- Receipt Summary (Left on desktop, Bottom on mobile) -->
        <div class="bg-[#f7f8fa] flex-1 p-5 h-[599px] rounded-tl-2xl rounded-bl-2xl max-[450px]:h-auto max-[450px]:p-4 max-[450px]:rounded-none max-[450px]:border-t max-[450px]:border-gray-200">
          <ReceiptView
            :selectedItems="selectedSale"
            :currentTime="currentTime"
            :updatable="false"
            :initialTaxEnabled="saleData.tax > 0"
            @close="emits('confirm')"
          />
        </div>

        <!-- Customer & Payment Section (Right on desktop, Top on mobile) -->
        <div class="w-1/2 p-6 flex flex-1 h-600px flex-col max-[450px]:w-full max-[450px]:p-4">
          <div class="flex flex-row justify-between items-center mb-4 max-[450px]:mb-3">
            <div class="flex flex-row gap-3 max-[450px]:gap-2">
              <div
                class="mt-1.5 w-10 h-10 bg-[rgba(5,113,108,0.1)] rounded-sm flex items-center justify-center max-[450px]:w-8 max-[450px]:h-8 max-[450px]:mt-0.5"
              >
                <IconCheckCertificate color="#05716c" class="max-[450px]:w-5 max-[450px]:h-5" />
              </div>
              <div class="flex flex-col justify-center">
                <h2 class="text-lg font-semibold max-[450px]:text-base">
                  {{ selectedCustomer ? 'Complete Sale' : 'Select Customer' }}
                </h2>
                <p class="text-gray-600 max-[450px]:text-sm max-[450px]:hidden">
                  {{
                    selectedCustomer
                      ? 'Finalize payment details'
                      : 'Choose a customer for this sale'
                  }}
                </p>
              </div>
            </div>
          </div>

          <!-- Customer Management Area -->
          <div class="flex-1 max-[450px]:overflow-y-auto">
            <!-- Customer Search -->
            <div v-if="!selectedCustomer" class="h-full">
              <CustomerSale v-if="customerView === 'search'" @select-customer="selectCustomer" />
            </div>

            <!-- Selected Customer & Complete Sale -->
            <div v-else class="h-full flex flex-col">
              <div class="bg-gray-50 p-4 rounded-lg mb-4 max-[450px]:p-3">
                <div class="flex flex-col gap-2.5 max-[450px]:gap-2">
                  <div>
                    <h3 class="font-medium max-[450px]:text-sm">Selected Customer</h3>
                    <p class="text-gray-600 max-[450px]:text-sm">{{ selectedCustomer.name }}</p>
                    <p class="text-sm text-gray-500 max-[450px]:text-xs">{{ selectedCustomer.phone }}</p>
                    <p v-if="selectedCustomer.email" class="text-sm text-gray-500 max-[450px]:text-xs">
                      {{ selectedCustomer.email }}
                    </p>
                  </div>

                  <textarea
                    class="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-mainColor text-sm max-[450px]:text-xs"
                    name=""
                    id=""
                    cols="30"
                    rows="2"
                    placeholder="Enter a note (Optional)"
                    v-model="saleData.note"
                  ></textarea>
                </div>
              </div>

              <button
                @click="completeSale"
                :disabled="isLoading"
                class="w-full mainBtn flex items-center justify-center transition duration-300 rounded-md max-[450px]:py-3"
              >
                <IconCheckCertificate class="w-5 h-5 max-[450px]:w-4 max-[450px]:h-4" color="#ffffff" />
                <span class="max-[450px]:text-sm">End Sale</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </VueFinalModal>
</template>



<template>
  <header>
    <div class="flex flex-row justify-between items-center" v-if="!isMobile">
      <div>
        <h2 class="text-gray-900 sm:text-gray-800">Dashboard</h2>
        <p class="mt-2.5 max-sm:hidden">An overview of your business performance</p>
        <p class="sm:hidden sm:text-gray-600">
          Here is a quick summary of what's happening with your business
        </p>
      </div>
      <div>
        <!-- Only show manual install button if auto-prompt hasn't shown yet -->
        <button
          v-if="canInstall && showDownloadBtn && !hasPrompted"
          @click="showInstallPrompt"
          class="rounded-xl bg-mainColor mt-2.5 text-white py-3 font-semibold shadow-lg"
        >
          Install App
        </button>
      </div>
    </div>
    
    <div class="flex flex-col" v-if="isMobile">
      <div>
        <h6>Overview Dashboard</h6>
        <p class="sm:hidden sm:text-gray-600">
          Here is a quick summary of what's happening with your business<br />
        </p>
        <h5 v-if="showDownloadBtn" class="mt-3 text-mainColor">download the app now, anywhere</h5>
      </div>
      
      <!-- Show platform-specific buttons only if auto-prompt hasn't shown -->
      <div v-if="showDownloadBtn && !hasPrompted" class="flex flex-start gap-3">
        <button
          v-if="canInstall"
          @click="showInstallPrompt"
          class="rounded-xl bg-mainColor mt-2.5 text-white py-3 font-semibold shadow-lg flex flex-row items-center gap-2"
          title="Download for ios"
        >
          <IconIOS class="w-5 h-5" />
          <span>IOS</span>
        </button>
        <button
          v-if="canInstall"
          @click="showInstallPrompt"
          class="rounded-xl bg-mainColor mt-2.5 text-white py-3 font-semibold shadow-lg flex flex-row items-center gap-2"
          title="Download for Android"
        >
          <IconAndroid class="w-5 h-5" />
          <span>Android</span>
        </button>
        <button
          v-if="canInstall"
          @click="showInstallPrompt"
          class="rounded-xl bg-mainColor mt-2.5 text-white py-3 font-semibold shadow-lg flex flex-row items-center gap-2"
          title="Download for desktop"
        >
          <IconDesktop />
          <span>Desktop</span>
        </button>
      </div>
    </div>
  </header>


  <div class="flex flex-row justify-between items-center">
  <!-- Title -->
  <div>
    <!-- Desktop / Tablet -->
    <h2 class="hidden min-[450px]:block text-gray-900 sm:text-gray-800">
      Dashboard
    </h2>
    <p class="hidden min-[450px]:block mt-2.5 text-gray-600">
      An overview of your business performance
    </p>

    <!-- Mobile -->
    <h6 class="block min-[450px]:hidden">Dashboard</h6>
    <p class="block min-[450px]:hidden text-gray-600">
      Business performance
    </p>
  </div>

  <!-- ONE Button -->
  <div>
    <button
      v-if="canInstall && showDownloadBtn"
      @click="installApp"
      class="rounded-xl bg-mainColor text-white font-semibold shadow-lg flex flex-row items-center gap-2
             py-2 min-[450px]:py-3"
      title="Install the App"
    >
      <IconDownloadBtn />
      <span class="hidden min-[450px]:inline">Install App</span>
      <span class="inline min-[450px]:hidden">Install</span>
    </button>
  </div>
</div>

</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import axios from 'axios'
import IconSearch from './IconSearch.vue'
import IconNotification from './IconNotification.vue'
import TheMobileMenu from './TheMobileMenu.vue'
import DateFilter from './DateFilter.vue'
import { useUserStore } from '@/stores/user'
import { useFormatCurrency } from '@/formatCurrency'
import ChartOrder from './ChartOrder.vue'
import ChartRevenueProfit from './ChartRevenueProfit.vue'
import { usePWAInstall } from '@/composables/usePWAInstall'
import IconIOS from './IconIOS.vue'
import IconAndroid from './IconAndroid.vue'
import IconDesktop from './IconDesktop.vue'

// Use the PWA composable
const { 
  canInstall, 
  installApp, 
  isInstalled, 
  showInstallPrompt, // Get this function from the composable
  engagementTime,
  userInteractions,
  pageViews 
} = usePWAInstall()

// Track if we've already shown the prompt
const hasPrompted = computed(() => {
  return localStorage.getItem('pwa_prompt_shown') === 'true'
})

// Mobile detection
const isMobile = ref(window.innerWidth < 450)
const showDownloadBtn = ref(false)

const handleResize = () => {
  isMobile.value = window.innerWidth < 450
}

onMounted(() => {
  handleResize()
  
  // Check if app is already installed as PWA
  const isPWA = window.matchMedia('(display-mode: standalone)').matches
  
  // Only show download button if not already installed
  if (!isPWA) {
    showDownloadBtn.value = true
  }
  
  // You can remove this line - the composable handles auto-prompt
  // if (isMobile.value) canInstall.value = true
  
  window.addEventListener('resize', handleResize)
  
  // Optional: Log engagement for debugging
  console.log('PWA Status:', {
    canInstall: canInstall.value,
    isInstalled: isInstalled.value,
    engagement: engagementTime.value,
    interactions: userInteractions.value,
    pageViews: pageViews.value
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// Rest of your existing code...
const { formatCurrency } = useFormatCurrency()
const { user } = useUserStore()
const isLoading = ref(false)

const dateRangeDate = reactive({
  start: '',
  end: '',
  user_type: user.userInfo.user_type,
})

const metrics = reactive({
  sales: 0,
  cost: 0,
  profit: 0,
  inStock: 0,
  stockValue: 0,
})

const orderData = ref(null)
const revenueProfitData = ref(null)
const topSelling = ref([])
const lowStock = ref([])
const topCustomers = ref([])
const slowestSelling = ref([])
const stockBrand = ref([])

const getMetrics = async () => {
  // Your existing metrics fetching code...
}

const handleDateRangeChange = (range) => {
  dateRangeDate.start = range.start
  dateRangeDate.end = range.end
  getMetrics()
}

const formatShortNumber = (num) => {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B'
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M'
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K'
  return num
}
</script>