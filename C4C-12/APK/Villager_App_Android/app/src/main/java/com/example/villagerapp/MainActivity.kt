package com.example.villagerapp

import android.annotation.SuppressLint
import android.app.Activity
import android.app.AlertDialog
import android.content.Context
import android.content.SharedPreferences
import android.graphics.Bitmap
import android.graphics.Color
import android.graphics.Typeface
import android.os.Bundle
import android.text.InputType
import android.view.GestureDetector
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.view.Window
import android.view.WindowManager
import android.webkit.*
import android.widget.*

class MainActivity : Activity() {
    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar
    private lateinit var errorLayout: LinearLayout
    private lateinit var errorText: TextView
    private lateinit var urlInput: EditText
    private lateinit var sharedPref: SharedPreferences
    private lateinit var gestureDetector: GestureDetector
    
    private val defaultUrl = "http://10.0.2.2:3001"
    private val prefKey = "villager_server_url"

    @SuppressLint("SetJavaScriptEnabled", "ClickableViewAccessibility")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Fully remove title bar and set full-screen mode for clean browser-like look
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        window.setFlags(
            WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
        )

        sharedPref = getSharedPreferences("GraamSehatPrefs", Context.MODE_PRIVATE)
        val currentUrl = sharedPref.getString(prefKey, defaultUrl) ?: defaultUrl

        // Root Layout (RelativeLayout)
        val rootLayout = RelativeLayout(this).apply {
            layoutParams = RelativeLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            setBackgroundColor(Color.parseColor("#0F172A")) // Modern slate-900 background
        }

        // WebView (100% full screen - No toolbars or developer headers)
        webView = WebView(this).apply {
            id = View.generateViewId()
            layoutParams = RelativeLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            
            // Premium settings for React PWA apps to run perfectly offline/online
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.databaseEnabled = true
            settings.allowFileAccess = true
            settings.allowContentAccess = true
            settings.loadWithOverviewMode = true
            settings.useWideViewPort = true
            settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            
            webViewClient = object : WebViewClient() {
                override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                    progressBar.visibility = View.VISIBLE
                    errorLayout.visibility = View.GONE
                }

                override fun onPageFinished(view: WebView?, url: String?) {
                    progressBar.visibility = View.GONE
                }

                @Deprecated("Deprecated in Java")
                override fun onReceivedError(
                    view: WebView?,
                    errorCode: Int,
                    description: String?,
                    failingUrl: String?
                ) {
                    showError(description ?: "Connection failed")
                }

                override fun onReceivedError(
                    view: WebView?,
                    request: WebResourceRequest?,
                    error: WebResourceError?
                ) {
                    if (request?.isForMainFrame == true) {
                        showError(error?.description?.toString() ?: "Connection failed")
                    }
                }
            }
            
            webChromeClient = WebChromeClient()
        }
        rootLayout.addView(webView)

        // Centered Progress Bar
        progressBar = ProgressBar(this).apply {
            val lp = RelativeLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            )
            lp.addRule(RelativeLayout.CENTER_IN_PARENT)
            layoutParams = lp
            visibility = View.VISIBLE
        }
        rootLayout.addView(progressBar)

        // Custom Error Layout (Only overlayed when offline/unconfigured)
        errorLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setBackgroundColor(Color.parseColor("#0F172A"))
            setPadding(dpToPx(24), dpToPx(24), dpToPx(24), dpToPx(24))
            
            val lp = RelativeLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            layoutParams = lp
            visibility = View.GONE
        }

        val card = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setBackgroundColor(Color.parseColor("#1E293B")) // Slate-800 Card
            setPadding(dpToPx(24), dpToPx(24), dpToPx(24), dpToPx(24))
            
            val lp = LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            )
            layoutParams = lp
        }

        val errTitle = TextView(this).apply {
            text = "GraamSehat Connection"
            setTextColor(Color.WHITE)
            textSize = 20f
            typeface = Typeface.DEFAULT_BOLD
            gravity = Gravity.CENTER
        }
        card.addView(errTitle)

        errorText = TextView(this).apply {
            text = "Could not connect to $currentUrl"
            setTextColor(Color.parseColor("#94A3B8"))
            textSize = 14f
            gravity = Gravity.CENTER
            setPadding(0, dpToPx(8), 0, dpToPx(16))
        }
        card.addView(errorText)

        val configBtn = Button(this).apply {
            text = "Configure Server IP"
            setBackgroundColor(Color.parseColor("#0D9488")) // Teal primary
            setTextColor(Color.WHITE)
            setOnClickListener {
                showSettingsDialog()
            }
        }
        card.addView(configBtn)

        val retryBtn = Button(this).apply {
            text = "Retry"
            setBackgroundColor(Color.TRANSPARENT)
            setTextColor(Color.parseColor("#0D9488"))
            setOnClickListener {
                val url = sharedPref.getString(prefKey, defaultUrl) ?: defaultUrl
                errorLayout.visibility = View.GONE
                webView.loadUrl(url)
            }
        }
        card.addView(retryBtn)

        errorLayout.addView(card)
        rootLayout.addView(errorLayout)

        setContentView(rootLayout)

        // Hidden gesture: Long press on the screen for 3 seconds to access server settings
        gestureDetector = GestureDetector(this, object : GestureDetector.SimpleOnGestureListener() {
            override fun onLongPress(e: MotionEvent) {
                showSettingsDialog()
            }
        })

        webView.setOnTouchListener { _, event ->
            gestureDetector.onTouchEvent(event)
            false
        }

        // Load the saved URL
        webView.loadUrl(currentUrl)
    }

    private fun showError(message: String) {
        progressBar.visibility = View.GONE
        val currentUrl = sharedPref.getString(prefKey, defaultUrl) ?: defaultUrl
        errorText.text = "$message\n\nCould not connect to:\n$currentUrl\n\nTo run normally, connect your phone and computer to the same Wi-Fi network and configure the server IP."
        errorLayout.visibility = View.VISIBLE
    }

    private fun showSettingsDialog() {
        val currentUrl = sharedPref.getString(prefKey, defaultUrl) ?: defaultUrl
        val builder = AlertDialog.Builder(this, AlertDialog.THEME_DEVICE_DEFAULT_DARK)
        builder.setTitle("Configure Server URL")

        val container = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dpToPx(24), dpToPx(8), dpToPx(24), dpToPx(8))
        }

        val hint = TextView(this).apply {
            text = "Enter the server URL of your development computer. Examples:\n• Local network: http://192.168.1.15:3001\n• Emulator loopback: http://10.0.2.2:3001\n• Live site: https://graamsehat-d5ede.web.app\n\n(After saving, the app runs cleanly full-screen with no headers or developer options!)"
            setTextColor(Color.parseColor("#94A3B8"))
            textSize = 12f
            setPadding(0, 0, 0, dpToPx(12))
        }
        container.addView(hint)

        urlInput = EditText(this).apply {
            setText(currentUrl)
            inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_URI
            setTextColor(Color.WHITE)
        }
        container.addView(urlInput)

        builder.setView(container)
        builder.setPositiveButton("Save & Load") { dialog, _ ->
            val enteredUrl = urlInput.text.toString().trim()
            if (enteredUrl.isNotEmpty()) {
                sharedPref.edit().putString(prefKey, enteredUrl).apply()
                errorLayout.visibility = View.GONE
                webView.loadUrl(enteredUrl)
            }
            dialog.dismiss()
        }
        builder.setNegativeButton("Cancel") { dialog, _ ->
            dialog.dismiss()
        }
        builder.show()
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }

    private fun dpToPx(dp: Int): Int {
        val density = resources.displayMetrics.density
        return (dp * density).toInt()
    }
}
