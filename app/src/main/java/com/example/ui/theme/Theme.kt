package com.example.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme = darkColorScheme(
    primary = GoldDark,
    secondary = GoldLight,
    tertiary = AmberAccent,
    background = MidnightObsidian,
    surface = CharcoalNavy,
    onPrimary = MidnightObsidian,
    onSecondary = MidnightObsidian,
    onBackground = IvoryWhite,
    onSurface = IvoryWhite,
    surfaceVariant = SlateGrey,
    onSurfaceVariant = IvoryWhite
)

private val LightColorScheme = lightColorScheme(
    primary = GoldDark,
    secondary = SlateGrey,
    tertiary = AmberAccent,
    background = IvoryWhite,
    surface = Color(0xFFF8F9FA),
    onPrimary = Color.White,
    onSecondary = Color.White,
    onBackground = MidnightObsidian,
    onSurface = MidnightObsidian
)

@Composable
fun MyApplicationTheme(
    darkTheme: Boolean = true, // Force luxurious dark theme by default for premium feel!
    dynamicColor: Boolean = false, // Disable dynamic colors to keep our premium gold look!
    content: @Composable () -> Unit,
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
