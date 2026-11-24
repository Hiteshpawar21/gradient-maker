import { test, expect } from '@playwright/test'

test.describe('Phase 2 – App Shell and Layout', () => {
  test('desktop layout (1920x1080) renders top bar, sidebar, and preview', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')

    // Top Bar
    await expect(page.getByRole('heading', { name: /Gradient Maker/i })).toBeVisible()
    await expect(page.getByLabel('Undo')).toBeVisible()
    await expect(page.getByLabel('Redo')).toBeVisible()
    await expect(page.getByRole('button', { name: /Randomize/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Reset/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Import/i })).toBeVisible()
    await expect(page.getByLabel('Toggle theme')).toBeVisible()

    // Left sidebar with type picker
    await expect(page.getByRole('complementary', { name: 'Gradient controls sidebar' }).getByText('Basic Gradients')).toBeVisible()
    await expect(page.getByRole('complementary', { name: 'Gradient controls sidebar' }).getByText('Advanced Gradients')).toBeVisible()
    await expect(page.getByRole('radio', { name: /Linear/i }).first()).toBeVisible()
    await expect(page.getByRole('radio', { name: /Radial/i }).first()).toBeVisible()
    await expect(page.getByRole('radio', { name: /Mesh/i }).first()).toBeVisible()

    // Preview area
    await expect(page.getByTestId('preview-canvas')).toBeVisible()
    await expect(
      page
        .getByRole('main', { name: 'Gradient preview area' })
        .getByText(/800 × 600 px/i),
    ).toBeVisible()
  })

  test('accordion panels open and close smoothly without layout jumps', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')

    // Check accordions exist
    const colorsHeader = page.getByRole('button', { name: /Colors/i }).first()
    const globalHeader = page.getByRole('button', { name: /Global/i }).first()
    const noiseHeader = page.getByRole('button', { name: /Noise & texture/i }).first()

    await expect(colorsHeader).toBeVisible()
    await expect(globalHeader).toBeVisible()
    await expect(noiseHeader).toBeVisible()

    // Toggle global accordion open
    await globalHeader.click()
    await expect(page.getByText(/Canvas Resolution/i).first()).toBeVisible()

    // Toggle noise accordion open
    await noiseHeader.click()
    await expect(page.getByText(/Enable noise overlay/i).first()).toBeVisible()

    // Toggle colors accordion closed
    await colorsHeader.click()

    // Ensure preview remains rendered and centered
    await expect(page.getByTestId('preview-canvas')).toBeVisible()
  })

  test('type picker updates active gradient type', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')

    const radialBtn = page.getByRole('radio', { name: /Radial/i }).first()
    await radialBtn.click()

    // Check indicator badge in preview
    await expect(page.getByText(/radial/i).first()).toBeVisible()
  })

  test('theme toggle switches dark and light modes', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')

    const html = page.locator('html')
    await expect(html).toHaveClass(/dark/)

    const themeToggle = page.getByLabel('Toggle theme')
    await themeToggle.click()
    await expect(html).not.toHaveClass(/dark/)

    await themeToggle.click()
    await expect(html).toHaveClass(/dark/)
  })

  test('export button opens export sidebar', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')

    const exportBtn = page.getByRole('button', { name: /Export/i }).first()
    await exportBtn.click()

    await expect(page.getByRole('complementary', { name: /Export sidebar/i })).toBeVisible()
  })

  test('mobile layout (360x740) shows preview on top and collapsible controls drawer', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 740 })
    await page.goto('/')

    // Top Bar brand is visible
    await expect(page.getByRole('heading', { name: /Gradient Maker/i })).toBeVisible()

    // Preview is visible on top
    await expect(page.getByTestId('preview-canvas')).toBeVisible()

    // Mobile controls drawer toggle exists
    const drawerHandle = page.getByRole('button', { name: /Expand controls/i })
    await expect(drawerHandle).toBeVisible()

    // Open drawer
    await drawerHandle.click()
    await expect(page.getByText('Gradient Type').last()).toBeVisible()

    // Close drawer
    const collapseHandle = page.getByRole('button', { name: /Collapse controls/i })
    await collapseHandle.click()
  })
})

test.describe('Phase 3 – Color System and Stop Editor', () => {
  test('editing stops, color formats, and undo/redo', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/')

    // Colors panel is open by default. Verify StopEditor controls are visible
    await expect(page.getByText('Gradient Stops Bar').first()).toBeVisible()
    await expect(page.getByText('Color Palette Picker').first()).toBeVisible()

    // Check color format tabs exist
    await expect(page.getByRole('button', { name: /hex/i }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /rgb/i }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /hsl/i }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /oklch/i }).first()).toBeVisible()

    // Add a stop
    const addStopBtn = page.getByRole('button', { name: /add stop/i }).first()
    await addStopBtn.click()

    // Check stop count increased to 3
    await expect(page.getByText(/3 stops/i).first()).toBeVisible()

    // Switch to OKLCH tab
    await page.getByRole('button', { name: /oklch/i }).first().click()
    await expect(page.getByLabel('OKLCH Lightness').first()).toBeVisible()
    await expect(page.getByLabel('OKLCH Chroma').first()).toBeVisible()
    await expect(page.getByLabel('OKLCH Hue').first()).toBeVisible()

    // Switch interpolation to OKLab
    const oklabBtn = page.getByRole('button', { name: /oklab/i }).first()
    await oklabBtn.click()

    // Undo the addition
    const undoBtn = page.getByLabel('Undo')
    await undoBtn.click()

    // Redo restores it
    const redoBtn = page.getByLabel('Redo')
    await redoBtn.click()
  })
})
