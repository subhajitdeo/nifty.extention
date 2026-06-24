
//@version=6
indicator("Nifty OI Levels - Thick Lines", overlay=true)

// =============================================
//  TEST DATA
// =============================================

buyEntry = input.float(23810.0, "Buy Entry")
buySL = input.float(23765.0, "Buy SL")
buyTarget1 = input.float(23840.0, "Buy Target 1")
buyTarget2 = input.float(23885.0, "Buy Target 2")
buyTarget3 = input.float(23930.0, "Buy Target 3")

sellEntry = input.float(23990.0, "Sell Entry")
sellSL = input.float(24035.0, "Sell SL")
sellTarget1 = input.float(23960.0, "Sell Target 1")
sellTarget2 = input.float(23915.0, "Sell Target 2")
sellTarget3 = input.float(23870.0, "Sell Target 3")

// =============================================
// LABELS AT THE END (LARGER TEXT, NO BOX)
// =============================================

if barstate.islast
    // Buy Levels - size=size.normal
    label.new(bar_index, buyEntry, text="BUY", color=color.green, style=label.style_none, textcolor=color.green, size=size.large)
    label.new(bar_index, buySL, text="SL", color=color.green, style=label.style_none, textcolor=color.green, size=size.normal)
    label.new(bar_index, buyTarget1, text="T1", color=color.green, style=label.style_none, textcolor=color.green, size=size.normal)
    label.new(bar_index, buyTarget2, text="T2", color=color.green, style=label.style_none, textcolor=color.green, size=size.normal)
    label.new(bar_index, buyTarget3, text="T3", color=color.green, style=label.style_none, textcolor=color.green, size=size.normal)
    
    // Sell Levels - size=size.normal
    label.new(bar_index, sellEntry, text="SELL", color=color.red, style=label.style_none, textcolor=color.red, size=size.large)
    label.new(bar_index, sellSL, text="SL", color=color.red, style=label.style_none, textcolor=color.red, size=size.normal)
    label.new(bar_index, sellTarget1, text="T1", color=color.red, style=label.style_none, textcolor=color.red, size=size.normal)
    label.new(bar_index, sellTarget2, text="T2", color=color.red, style=label.style_none, textcolor=color.red, size=size.normal)
    label.new(bar_index, sellTarget3, text="T3", color=color.red, style=label.style_none, textcolor=color.red, size=size.normal)
    
// Buy Levels
plot(buyEntry, title="Buy Entry", color=color.green, linewidth=2, style=plot.style_stepline)
plot(buySL, title="Buy SL", color=color.green, linewidth=2, style=plot.style_circles)
plot(buyTarget1, title="Buy Target 1", color=color.green, linewidth=2, style=plot.style_stepline)
plot(buyTarget2, title="Buy Target 2", color=color.green, linewidth=2, style=plot.style_stepline)
plot(buyTarget3, title="Buy Target 3", color=color.green, linewidth=2, style=plot.style_stepline)

// Sell Levels
plot(sellEntry, title="Sell Entry", color=color.red, linewidth=2, style=plot.style_stepline)
plot(sellSL, title="Sell SL", color=color.red, linewidth=2, style=plot.style_circles)
plot(sellTarget1, title="Sell Target 1", color=color.red, linewidth=2, style=plot.style_stepline)
plot(sellTarget2, title="Sell Target 2", color=color.red, linewidth=2, style=plot.style_stepline)
plot(sellTarget3, title="Sell Target 3", color=color.red, linewidth=2, style=plot.style_stepline)
