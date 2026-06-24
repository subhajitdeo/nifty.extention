//@version=6
indicator("Nifty OI Levels with Labels", overlay=true, max_labels_count=50)

// =============================================
// FAKE TEST DATA
// =============================================

ceSecondHighest = input.float(24200.0, "CE 2nd Highest OI")
peSecondHighest = input.float(23900.0, "PE 2nd Highest OI")
ceHighestVolume = input.float(24000.0, "CE Highest Volume")
peHighestVolume = input.float(23800.0, "PE Highest Volume")

buyEntry = input.float(23810.0, "Buy Entry")
buySL = input.float(23755.0, "Buy SL")
buyTarget1 = input.float(23840.0, "Buy Target 1")
buyTarget2 = input.float(23880.0, "Buy Target 2")

sellEntry = input.float(24190.0, "Sell Entry")
sellSL = input.float(24245.0, "Sell SL")
sellTarget1 = input.float(24160.0, "Sell Target 1")
sellTarget2 = input.float(24120.0, "Sell Target 2")

// =============================================
// DRAW LINES WITH LABELS
// =============================================

// Helper function to draw line with label
drawLabeledLine(price, color, style, width, labelText) =>
    if price != 0 and not na(price)
        // Draw the line
        line.new(bar_index[1], price, bar_index, price, color=color, width=width, style=style)
        // Add label at the right edge
        label.new(bar_index, price, text=labelText, color=color, style=label.style_label_left, textcolor=color.white, size=size.small)

// =============================================
// DRAW ALL LEVELS
// =============================================

// OI Levels
drawLabeledLine(ceSecondHighest, color.yellow, line.style_dashed, 2, "CE 2nd")
drawLabeledLine(peSecondHighest, color.orange, line.style_dashed, 2, "PE 2nd")
drawLabeledLine(ceHighestVolume, color.blue, line.style_solid, 2, "CE Vol")
drawLabeledLine(peHighestVolume, color.purple, line.style_solid, 2, "PE Vol")

// Buy Levels
drawLabeledLine(buyEntry, color.green, line.style_solid, 2, "BUY ENTRY")
drawLabeledLine(buySL, color.green, line.style_dotted, 2, "BUY SL")
drawLabeledLine(buyTarget1, color.green, line.style_dashed, 2, "BUY T1")
drawLabeledLine(buyTarget2, color.green, line.style_dashed, 2, "BUY T2")

// Sell Levels
drawLabeledLine(sellEntry, color.red, line.style_solid, 2, "SELL ENTRY")
drawLabeledLine(sellSL, color.red, line.style_dotted, 2, "SELL SL")
drawLabeledLine(sellTarget1, color.red, line.style_dashed, 2, "SELL T1")
drawLabeledLine(sellTarget2, color.red, line.style_dashed, 2, "SELL T2")

//////////////////////////////////////////////


// OI Levels
plot(ceSecondHighest, title="CE 2nd Highest", color=color.yellow, linewidth=2, style=plot.style_circles)
plot(peSecondHighest, title="PE 2nd Highest", color=color.orange, linewidth=2, style=plot.style_circles)
plot(ceHighestVolume, title="CE Highest Volume", color=color.blue, linewidth=2, style=plot.style_stepline)
plot(peHighestVolume, title="PE Highest Volume", color=color.purple, linewidth=2, style=plot.style_stepline)

// Buy Levels
plot(buyEntry, title="Buy Entry", color=color.green, linewidth=2, style=plot.style_stepline)
plot(buySL, title="Buy SL", color=color.green, linewidth=2, style=plot.style_circles)
plot(buyTarget1, title="Buy Target 1", color=color.green, linewidth=2, style=plot.style_stepline)
plot(buyTarget2, title="Buy Target 2", color=color.green, linewidth=2, style=plot.style_stepline)

// Sell Levels
plot(sellEntry, title="Sell Entry", color=color.red, linewidth=2, style=plot.style_stepline)
plot(sellSL, title="Sell SL", color=color.red, linewidth=2, style=plot.style_circles)
plot(sellTarget1, title="Sell Target 1", color=color.red, linewidth=2, style=plot.style_stepline)
plot(sellTarget2, title="Sell Target 2", color=color.red, linewidth=2, style=plot.style_stepline)
