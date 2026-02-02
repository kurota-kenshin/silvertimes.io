import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";

interface BlogPostData {
  id: string;
  title: string;
  category: string;
  date: string;
  mainImage: string;
  excerpt: string;
  content: React.ReactNode;
}

// Citation superscript component
const Cite = ({ n }: { n: number }) => (
  <sup className="text-blue-400 text-xs ml-0.5 cursor-pointer hover:text-blue-300">
    [{n}]
  </sup>
);

// Blog post content for "Silver Market Brief: The $100 Horizon"
const silverMarketBrief100HorizonContent = (
  <>
    {/* Market Outlook Banner */}
    <section className="mb-12">
      <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/30 rounded-2xl p-8 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-green-400 font-semibold">Market Outlook:</span>
          <span className="text-white font-bold">Bullish (Vertical Phase)</span>
        </div>
        <p className="text-silver-300 leading-relaxed">
          Silver has entered a "Vertical Phase" of its bull market. As the metal
          breaches historic psychological barriers, the defining theme of early
          2026 is the decoupling of physical supply from paper derivatives.
        </p>
      </div>
    </section>

    {/* 1. Market Performance: Early 2026 Review */}
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-white mb-6">
        1. Market Performance: Early 2026 Review
      </h2>

      <p className="text-silver-300 leading-relaxed mb-4">
        The first two weeks of 2026 have seen silver outperform nearly all major
        asset classes.
      </p>

      <ul className="space-y-3 text-silver-300">
        <li className="flex items-start gap-3">
          <span className="text-blue-400 mt-1">•</span>
          <span>
            <strong className="text-white">Year-to-Date Gains:</strong> Building
            on a stellar 150% gain in 2025, silver has surged an additional 22%
            YTD.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-blue-400 mt-1">•</span>
          <span>
            <strong className="text-white">Record Highs:</strong> After a brief
            dip to $74 during index rebalancing, the metal touched a new
            all-time high of $93.12 on January 14.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-blue-400 mt-1">•</span>
          <span>
            <strong className="text-white">Gold/Silver Ratio:</strong> Silver is
            outperforming gold by a factor of 4:1, dropping the ratio to a
            decade-low of 50.
          </span>
        </li>
      </ul>
    </section>

    {/* 2. Structural Drivers of the Surge */}
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-white mb-6">
        2. Structural Drivers of the Surge
      </h2>

      {/* A. Global Inventory Squeeze */}
      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-white mb-4">
          A. Global Inventory Squeeze
        </h3>
        <p className="text-silver-300 leading-relaxed mb-4">
          A systemic "drain" is occurring across the three primary trading hubs:
        </p>
        <ul className="space-y-3 text-silver-300">
          <li className="flex items-start gap-3">
            <span className="text-blue-400 mt-1">•</span>
            <span>
              <strong className="text-white">COMEX:</strong> Registered stocks
              are at a critical 28M oz, while delivery demands for the March
              contract exceed 500M oz.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-400 mt-1">•</span>
            <span>
              <strong className="text-white">LBMA (London):</strong> Over 85% of
              holdings are held by ETFs and private wealth, leaving the physical
              "float" for industrial clearing dangerously thin.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-400 mt-1">•</span>
            <span>
              <strong className="text-white">Shanghai (SGE):</strong> SGE
              premiums have ballooned to +$10/oz over London spot, signaling an
              acute localized shortage in Asia.
            </span>
          </li>
        </ul>
      </div>

      {/* B. ETF "HODL" Mentality */}
      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-white mb-4">
          B. ETF "HODL" Mentality
        </h3>
        <p className="text-silver-300 leading-relaxed mb-4">
          Contrary to previous rallies, ETF investors are not selling into the
          current strength.
        </p>
        <ul className="space-y-3 text-silver-300">
          <li className="flex items-start gap-3">
            <span className="text-blue-400 mt-1">•</span>
            <span>
              <strong className="text-white">Stability:</strong> Holdings in
              SLV, SIVR, and PSLV remain stable, with only a small net outflow
              of roughly $300 million.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-400 mt-1">•</span>
            <span>
              <strong className="text-white">Market Impact:</strong> This "HODL"
              mentality is removing the primary liquidity buffer that
              traditionally dampens price spikes.
            </span>
          </li>
        </ul>
      </div>

      {/* C. Policy Pivot: The "Tariff Floor" */}
      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-white mb-4">
          C. Policy Pivot: The "Tariff Floor"
        </h3>
        <p className="text-silver-300 leading-relaxed mb-4">
          On January 15, President Trump postponed new percentage-based tariffs
          on processed critical minerals (including silver).
        </p>
        <ul className="space-y-3 text-silver-300">
          <li className="flex items-start gap-3">
            <span className="text-blue-400 mt-1">•</span>
            <span>
              <strong className="text-white">Market Reaction:</strong> Silver
              initially plunged to a low of $86.25, but the dip was aggressively
              bought back to $91.68 by Friday's close.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-400 mt-1">•</span>
            <span>
              <strong className="text-white">Psychological Safety Net:</strong>{" "}
              The administration's proposal of "Price Floors" to protect
              domestic miners signaled that the US government values silver at
              high prices. Traders now interpret this as a fundamental price
              floor.
            </span>
          </li>
        </ul>
      </div>
    </section>

    {/* 3. The BCOM Rebalancing Paradox */}
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-white mb-6">
        3. The BCOM Rebalancing Paradox
      </h2>

      <p className="text-silver-300 leading-relaxed mb-4">
        Typically, the Bloomberg Commodity Index (BCOM) rebalancing in early
        January triggers heavy selling of previous winners.
      </p>

      <ul className="space-y-3 text-silver-300">
        <li className="flex items-start gap-3">
          <span className="text-blue-400 mt-1">•</span>
          <span>
            <strong className="text-white">The Absorption:</strong> While an
            estimated $7.1B of silver was slated for sale, new buyers
            immediately absorbed the volume.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-blue-400 mt-1">•</span>
          <span>
            <strong className="text-white">Modest Net Change:</strong> Index
            funds sold roughly 13,000 contracts, but net open interest only fell
            by about 4,000. This highlights that the physical squeeze remains
            the predominant force driving prices.
          </span>
        </li>
      </ul>
    </section>

    {/* 4. Technical Outlook: The Path to $100 */}
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-white mb-6">
        4. Technical Outlook: The Path to $100
      </h2>

      <ul className="space-y-3 text-silver-300">
        <li className="flex items-start gap-3">
          <span className="text-blue-400 mt-1">•</span>
          <span>
            <strong className="text-white">Elliott Wave Count:</strong> We are
            in the terminal Sub-wave v of Major Wave III, the "blow-off" stage.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-blue-400 mt-1">•</span>
          <span>
            <strong className="text-white">Golden Target:</strong> The 1.618
            Fibonacci Extension projects a target of $100.15.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-blue-400 mt-1">•</span>
          <span>
            <strong className="text-white">Critical Support:</strong> The "Line
            in the Sand" for the bull market is $84.00.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-blue-400 mt-1">•</span>
          <span>
            <strong className="text-white">RSI Warning:</strong> The RSI is near
            88, signaling the market is "historically overbought". Expect high
            volatility near the $100 level.
          </span>
        </li>
      </ul>
    </section>

    {/* Bottom Chart */}
    <section className="mb-12">
      <div className="my-10">
        <img
          src="/press/press_2/chart.jpeg"
          alt="Silver Market Technical Analysis Chart"
          className="w-full rounded-2xl border border-white/10"
        />
      </div>
    </section>

    {/* Conclusion */}
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-white mb-6">Conclusion</h2>

      <p className="text-silver-300 leading-relaxed mb-6">
        The combination of China's export ban and the COMEX inventory drain has
        created a "perfect storm". While the RSI suggests a cooling period is
        due, the fundamental scarcity suggests any dip toward $84–$86 will be
        aggressively bought.
      </p>
    </section>

    {/* Disclaimer */}
    <section className="mb-12">
      <div className="bg-background-secondary/30 border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-3">Disclaimer</h3>
        <p className="text-silver-400 text-sm leading-relaxed">
          The information provided in this article is for informational purposes
          only and does not constitute financial, investment, or legal advice.
          Trading in commodities involves significant risk. You should consult
          with a qualified financial advisor before making any investment
          decisions.
        </p>
      </div>
    </section>

    {/* References */}
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-white mb-6">References</h2>

      <div className="bg-background-secondary/30 border border-white/10 rounded-2xl p-8">
        <ul className="space-y-3 text-silver-400 text-sm">
          <li>
            <a
              href="https://www.cmegroup.com/markets/metals/precious/silver.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              COMEX
            </a>
            , accessed on January 18, 2026
          </li>
          <li>
            <a
              href="https://www.lbma.org.uk/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              London Bullion Market Association (LBMA)
            </a>
            , accessed on January 18, 2026
          </li>
          <li>
            <a
              href="https://www.sge.com.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Shanghai Gold Exchange (SGE)
            </a>
            , accessed on January 18, 2026
          </li>
        </ul>
      </div>
    </section>
  </>
);

// Blog post content for "The Great Silver Paradigm Shift"
const silverParadigmShiftContent = (
  <>
    {/* Executive Summary */}
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-white mb-6">
        Executive Summary: The Year Silver Broke Free
      </h2>

      <div className="bg-gradient-to-br from-blue-500/10 to-violet-500/10 border border-white/10 rounded-2xl p-8 mb-8">
        <h3 className="text-xl font-semibold text-blue-400 mb-4">
          Key Takeaways
        </h3>
        <ul className="space-y-3 text-silver-300">
          <li className="flex items-start gap-3">
            <span className="text-blue-400 mt-1">•</span>
            <span>
              <strong className="text-white">A Historic Repricing:</strong> 2025
              was the year silver broke free, posting gains of over 140% and
              hitting an all-time high of ~$84, driven by physical scarcity
              rather than paper speculation.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-400 mt-1">•</span>
            <span>
              <strong className="text-white">The Inventory Shortage:</strong> A
              cumulative 1-billion-ounce deficit since 2019 has drained global
              vaults. Physical shortages in Shanghai and London are now
              dictating global spot prices.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-400 mt-1">•</span>
            <span>
              <strong className="text-white">Strategic Shift:</strong> Silver is
              no longer just a currency hedge; it is a strategic industrial
              asset. China's new export controls and the US "Critical Mineral"
              designation have turned the supply chain into a geopolitical
              battleground.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-400 mt-1">•</span>
            <span>
              <strong className="text-white">The New Floor:</strong> The
              structural squeeze suggests the days of sub-$30 silver are over.
              $50 per ounce has emerged as the new psychological and physical
              floor for 2026.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-400 mt-1">•</span>
            <span>
              <strong className="text-white">Industrial Demand is Key:</strong>{" "}
              Inelastic demand from Solar PV, EVs, and AI hardware is
              overwhelming flat mine supply, creating a long-term bullish case
              despite short-term volatility.
            </span>
          </li>
        </ul>
      </div>

      <p className="text-silver-300 leading-relaxed mb-6">
        The financial year of 2025 will undoubtedly be recorded in economic
        history as a watershed moment for the global silver market, marking the
        definitive decoupling of the metal from its traditional tether to gold
        and speculative paper derivatives to be repriced as a critical strategic
        industrial asset. After decades of trading in the shadow of its monetary
        cousin and being subject to the caprices of high-frequency trading
        algorithms, silver staged a parabolic breakout in the fourth quarter
        that fundamentally altered its valuation model. This culminated in the
        historic "Christmas Rally" of December 2025, a period of extreme
        volatility and price discovery that saw silver briefly shatter the $80
        per ounce ceiling before regulatory intervention precipitated a sharp
        correction.
      </p>

      <p className="text-silver-300 leading-relaxed mb-6">
        This comprehensive research report, produced specifically for the Silver
        RWA community, provides an exhaustive supply and demand analysis of this
        transformative year. We aim to dissect the mechanics of the market
        movements, moving beyond superficial headlines to understand the deep
        structural currents that drove prices to record highs. The evidence
        gathered from global exchanges, mining reports, and geopolitical
        developments suggests that the 2025 rally was not a fleeting speculative
        bubble, but rather the violent resolution of a seven-year structural
        deficit that had been building largely unnoticed by the mainstream
        financial press.
      </p>

      {/* Global Squeeze Image */}
      <div className="my-10">
        <img
          src="/press/press_1/1.jpeg"
          alt="Silver Price 2025: The Global Squeeze"
          className="w-full rounded-2xl border border-white/10"
        />
      </div>

      <p className="text-silver-300 leading-relaxed mb-6">
        By December 2025, the cumulative supply shortfall since 2019 had
        exceeded 1 billion ounces, effectively draining above-ground liquidity
        to critically low levels across the world's major trading hubs.
        <Cite n={1} /> For the first time in the modern era, pricing power began
        to shift aggressively from the derivatives markets of the
        West—specifically the COMEX in New York and the LBMA in London—to the
        physical delivery centers of the East, most notably the Shanghai Gold
        Exchange (SGE) and the Shanghai Futures Exchange (SHFE). This geographic
        arbitrage, driven by China's insatiable industrial appetite, forced a
        reckoning in global spot prices.
      </p>

      <p className="text-silver-300 leading-relaxed mb-6">
        The catalysts for this repricing were manifold and mutually reinforcing.
        They included a classic "gamma squeeze" in the options market that
        forced market makers to chase price action; unprecedented and inelastic
        industrial demand from the burgeoning solar photovoltaic and Artificial
        Intelligence sectors; and a decisive geopolitical pivot by the People's
        Republic of China to classify silver as a restricted strategic resource,
        instituting strict export controls that shocked global supply chains.
        <Cite n={3} /> While regulatory interventions in the form of aggressive
        CME margin hikes triggered the so-called "Christmas Crash," the market
        structure has been irrevocably altered. With global inventories at
        multi-year lows and mine supply structurally inelastic due to geological
        constraints, $50 per ounce has emerged as the new psychological and
        physical floor for the metal.
        <Cite n={1} />
      </p>

      <p className="text-silver-300 leading-relaxed">
        This report offers retail investors and industry observers a granular,
        data-driven understanding of why the "poor man's gold" has evolved into
        the world's most critical strategic metal, detailing the supply chain
        vulnerabilities, the demand shocks, and the future outlook for 2026.
      </p>
    </section>

    {/* Section 1: The 2025 Market Landscape */}
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-white mb-6">
        1. The 2025 Market Landscape: A Year of Records and Ruptures
      </h2>

      <h3 className="text-2xl font-semibold text-white mb-4">
        1.1 The Quantitative Breakout and Asset Class Outperformance
      </h3>

      <p className="text-silver-300 leading-relaxed mb-6">
        Silver delivered one of the most explosive performances in the history
        of commodities during 2025, posting annual gains that exceeded 140% by
        the close of the year.
        <Cite n={1} /> To contextualize the magnitude of this move, it is
        necessary to compare it against other major asset classes. While gold,
        the traditional safe-haven asset, posted a robust and historically
        significant gain of roughly 65-70% driven by central bank buying,
        silver's performance was more than double that of its yellow
        counterpart.
        <Cite n={6} /> Furthermore, silver absolutely crushed the broader equity
        markets; the S&P 500, despite a strong year driven by the AI narrative,
        posted a gain of roughly 16%.
        <Cite n={8} />
      </p>

      <p className="text-silver-300 leading-relaxed mb-6">
        This performance gap highlights a critical theme of 2025: the return of
        the "beta" trade, where silver acts as a high-octane version of gold,
        but also the emergence of an "alpha" trade, where silver moves
        independently based on its own idiosyncratic fundamentals. For years,
        the Gold-to-Silver Ratio (GSR)—a key metric used by precious metals
        investors to determine the relative value of the two metals—hovered
        stubbornly near 80:1 or even 100:1. This signaled a profound historical
        undervaluation of silver. By late December 2025, however, this ratio had
        collapsed to approximately 57:1.
        <Cite n={6} /> This compression was not merely a statistical mean
        reversion; it was a market signal that silver was being priced for its
        industrial utility and scarcity rather than just its precious metal
        correlation.
      </p>

      <p className="text-silver-300 leading-relaxed mb-6">
        The climax of the year occurred in December. Following a decisive
        technical breakout above the $50 multi-year resistance level in
        October—a level that had capped prices since the 1980 Hunt Brothers
        squeeze and the 2011 peak—prices went parabolic. On Sunday, December 28,
        amidst thin holiday trading, silver futures spiked to an intraday
        all-time high of approximately $84.00 per ounce.
        <Cite n={6} /> This move shattered the previous nominal record of
        $49.45, psychologically liberating the market from forty-five years of
        resistance.
        <Cite n={11} />
      </p>

      {/* Silver Price Action 2025 Chart */}
      <div className="my-10">
        <img
          src="/press/press_1/3.jpeg"
          alt="Silver Price Action 2025"
          className="w-full rounded-2xl border border-white/10"
        />
      </div>

      <h3 className="text-2xl font-semibold text-white mb-4 mt-8">
        1.2 The "Christmas Rally" Phenomenon: Anatomy of a Squeeze
      </h3>

      <p className="text-silver-300 leading-relaxed mb-6">
        The "Christmas Rally" of 2025 was driven by a perfect storm of low
        liquidity, high anxiety, and relentless physical accumulation.
        Historically, the "Santa Claus Rally" refers to a seasonal tendency for
        equities to rise in the final week of December due to tax considerations
        and optimism for the new year. In 2025, however, this liquidity vacuum
        was weaponized in the precious metals market to trigger a massive
        squeeze.
      </p>

      <p className="text-silver-300 leading-relaxed mb-6">
        As Western trading desks went skeleton-staffed for the holiday season,
        physical buyers in Asia continued to bid aggressively. The divergence
        between paper prices (futures) and physical reality became undeniable.
        While Western paper markets were often closed or thinly traded, physical
        premiums on the Shanghai Gold Exchange (SGE) exploded, trading at
        double-digit dollar premiums over the theoretical COMEX price.
        <Cite n={9} /> This arbitrage window incentivized a massive movement of
        physical metal from West to East, further tightening the Atlantic
        markets.
      </p>

      <p className="text-silver-300 leading-relaxed">
        However, this rally was met with a brutal counter-attack from market
        regulators. On December 29 and 30, the CME Group, operator of the COMEX,
        implemented aggressive margin hikes to curb the exploding volatility.
        <Cite n={13} />
        <Cite n={14} /> By significantly raising the capital requirements
        ("initial margin") required to hold silver contracts, the exchange
        forced leveraged speculators to liquidate their positions or face
        default. The resulting "Christmas Crash" saw silver plunge nearly 10-14%
        in single trading sessions, pulling prices back to the $70 range by
        year-end.
        <Cite n={15} /> Despite this volatility, the year-end close represented
        a paradigm shift, solidifying the metal's valuation in a completely new
        tier and leaving the sub-$30 prices of the past as a distant memory.
      </p>
    </section>

    {/* Section 2: The Supply Crisis */}
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-white mb-6">
        2. The Supply Crisis: Seven Years of Structural Deficits
      </h2>

      <h3 className="text-2xl font-semibold text-white mb-4">
        2.1 The Cumulative Deficit Analysis
      </h3>

      <p className="text-silver-300 leading-relaxed mb-6">
        To truly comprehend the violence of the 2025 price action, one must look
        beneath the surface of daily charts to the fundamental geology and
        economics of the silver market. The market has been operating in a
        persistent, deepening structural deficit since 2019. According to data
        compiled from the Silver Institute and other industry analysts, the
        cumulative supply shortfall from 2019 through the end of 2025 has
        exceeded 1 billion ounces.
        <Cite n={1} />
      </p>

      <p className="text-silver-300 leading-relaxed mb-6">
        This deficit is not a mere accounting abstraction; it represents a
        physical drawdown of above-ground stocks. For five consecutive years,
        the world has consumed significantly more silver than it has produced.
        In 2024 alone, the deficit was estimated at roughly 149 million ounces.
        While the 2025 deficit was projected to narrow slightly to roughly
        95-117 million ounces, the cumulative effect of these consecutive
        shortfalls has been the draining of global vaults.
        <Cite n={17} />
      </p>

      {/* Market Balance Chart */}
      <div className="my-10">
        <img
          src="/press/press_1/2.jpeg"
          alt="Market Balance Less ETPs (2019-2024)"
          className="w-full rounded-2xl border border-white/10"
        />
      </div>

      <p className="text-silver-300 leading-relaxed mb-6">
        The concept of "above-ground stocks" has historically been used by
        bearish analysts to argue that there is plenty of silver available to
        meet demand. However, the events of 2025 proved that much of this
        inventory is "sticky"—it is held by long-term investors, locked in ETFs,
        or utilized in industrial forms (like silverware or decorative items)
        that are not easily recyclable or mobilized. The "free float"—liquid
        silver available for immediate delivery to exchanges like the LBMA or
        COMEX—effectively evaporated in late 2025, leaving the market vulnerable
        to the price shocks we witnessed.
      </p>

      <h3 className="text-2xl font-semibold text-white mb-4 mt-8">
        2.2 The Inelasticity of Mine Supply
      </h3>

      <p className="text-silver-300 leading-relaxed mb-6">
        A critical and often misunderstood factor driving this deficit is the
        extreme inelasticity of silver mine supply. Unlike gold, which is
        primarily mined for its own value, approximately 72% to 80% of global
        silver production comes as a byproduct of lead, zinc, copper, and gold
        mining.
        <Cite n={1} />
      </p>

      <p className="text-silver-300 leading-relaxed mb-6">
        This geological reality has profound economic implications for the
        silver market:
      </p>

      <ul className="space-y-4 text-silver-300 mb-6">
        <li className="flex items-start gap-3">
          <span className="text-blue-400 mt-1">•</span>
          <span>
            <strong className="text-white">Price Insensitivity:</strong> Because
            silver is a secondary revenue stream for a copper or zinc miner,
            these companies do not ramp up production merely because silver
            prices rise. A massive copper mine in Chile or a zinc mine in
            Australia determines its production output based on the price of
            copper or zinc, not silver. Therefore, even if silver hits $100,
            these mines will not produce more unless the base metal markets also
            demand it.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-blue-400 mt-1">•</span>
          <span>
            <strong className="text-white">Development Lag Times:</strong> Even
            for primary silver miners (the remaining 20-28% of supply), the
            timeline from discovery to production is immense. New mining
            projects face rigorous permitting, environmental studies, and
            construction phases that can take 10 to 15 years. The severe lack of
            capital investment in the sector between 2011 and 2020 meant there
            was no pipeline of new projects ready to come online in 2025 to meet
            the demand surge.
            <Cite n={2} />
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-blue-400 mt-1">•</span>
          <span>
            <strong className="text-white">Declining Ore Grades:</strong> Global
            mine production has remained essentially flat, hovering between 815
            and 845 million ounces annually, despite the explosive price
            incentives.
            <Cite n={1} /> Ore grades at major primary mines have deteriorated,
            meaning miners must move more tons of earth to recover the same
            amount of silver, increasing costs and capping output.
          </span>
        </li>
      </ul>

      <p className="text-silver-300 leading-relaxed mb-6">
        In 2025, global mine production was projected to remain stagnant at
        approximately 835 million ounces, a level wholly insufficient to cover
        even industrial demand, let alone the resurgence in investment buying.
        <Cite n={2} />
      </p>

      <h3 className="text-2xl font-semibold text-white mb-4 mt-8">
        2.3 The Failure of Recycling to Fill the Gap
      </h3>

      <p className="text-silver-300 leading-relaxed mb-6">
        Historically, market analysts believed that high prices would elicit a
        flood of recycled silver (scrap) to balance the market. The theory was
        that as prices rose, grandmother's silverware and old jewelry would
        flood into refineries. While 2025 did see an uptick in
        recycling—particularly from silverware and jewelry as prices crossed the
        psychological $50 threshold—industrial recycling remains technically
        challenging and largely uneconomical.
      </p>

      <p className="text-silver-300 leading-relaxed">
        Much of the silver used in modern electronics, smartphones, and solar
        panels is "thrifty" usage—microscopic amounts embedded in complex
        matrices of other materials. Recovering this silver is energy-intensive,
        environmentally hazardous, and expensive. While recycling rose by
        approximately 6% in 2024, reaching a 12-year high of roughly 194 million
        ounces, this increase was negligible compared to the widening industrial
        deficit.
        <Cite n={20} /> The "scrap flood" that bears predicted would cap prices
        at $50 never materialized in sufficient volume to halt the rally,
        proving that modern industrial demand is largely dissipative—once the
        silver is used, it is often gone forever.
      </p>
    </section>

    {/* Section 3: The Inventory Squeeze */}
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-white mb-6">
        3. The Inventory Squeeze: The Disconnect Between Paper and Physical
      </h2>

      <p className="text-silver-300 leading-relaxed mb-6">
        The defining narrative of the 2025 silver market was the breakdown of
        the "Paper Market" (futures and derivatives) due to the exhaustion of
        the "Physical Market." This disconnect manifested visibly in the three
        major global vaults: COMEX (New York), LBMA (London), and the SGE/SHFE
        (Shanghai).
      </p>

      {/* COMEX Vault Physical Squeeze */}
      <div className="my-10">
        <img
          src="/press/press_1/5.jpeg"
          alt="2025 Silver Rally: Physical Squeeze - COMEX Vault"
          className="w-full rounded-2xl border border-white/10"
        />
      </div>

      <h3 className="text-2xl font-semibold text-white mb-4 mt-8">
        3.1 COMEX: The Emptying of New York
      </h3>

      <p className="text-silver-300 leading-relaxed mb-6">
        The COMEX (Commodity Exchange, Inc.) has traditionally been the primary
        venue for price discovery, despite dealing primarily in paper contracts
        where cash settlement is the norm. However, in 2025, market participants
        began standing for delivery in unprecedented numbers, breaking the
        implicit agreement that futures are for hedging, not sourcing metal.
      </p>

      <p className="text-silver-300 leading-relaxed mb-6">
        Registered inventories—silver that is warranted and available for
        immediate delivery against futures contracts—plummeted. By late 2025,
        registered stocks had declined by approximately 70% from their 2020
        peaks.
        <Cite n={1} /> From a high of nearly 150 million ounces in the
        registered category, levels dropped toward the 30-40 million ounce
        range. This is a dangerously low buffer for an exchange that trades
        hundreds of millions of ounces in paper volume daily.
      </p>

      <p className="text-silver-300 leading-relaxed mb-6">
        This physical stress resulted in a market condition known as
        "backwardation." In a healthy market, prices exist in "contango," where
        future delivery costs more than immediate delivery (reflecting storage,
        insurance, and interest costs). In Q4 2025, the silver curve inverted.
        Spot prices traded significantly higher than future months, a classic
        and urgent signal of physical scarcity.
        <Cite n={1} /> Traders were willing to pay a premium to get their hands
        on metal now rather than wait, fearing that the metal might not be
        available in the future.
      </p>

      <h3 className="text-2xl font-semibold text-white mb-4 mt-8">
        3.2 LBMA: The London Emergency and Lease Rate Spikes
      </h3>

      <p className="text-silver-300 leading-relaxed mb-6">
        London is the hub of the physical wholesale market, where the vast
        majority of the world's silver trades over-the-counter (OTC). In October
        2025, the London market experienced a near-systemic failure. Lease
        rates—the interest rate paid to borrow physical silver—spiked violently.
        Short-term overnight lease rates annualized at over 100% at the peak of
        the squeeze, while one-month rates jumped to over 30%.
        <Cite n={22} />
      </p>

      <p className="text-silver-300 leading-relaxed mb-6">
        This spike indicated a desperate scramble for physical bars. Bullion
        banks and industrial users who were short the metal (had sold it without
        owning it) needed to borrow it to meet delivery obligations, but there
        were no lenders. To solve this liquidity crisis, London was forced to
        import massive quantities of silver.
      </p>

      <p className="text-silver-300 leading-relaxed mb-6">
        Data from October 2025 reveals a record inflow of 54 million ounces into
        London vaults.
        <Cite n={22} /> Crucially, much of this metal was sourced from China and
        COMEX warehouses. This was not a sign of abundance, but of an emergency
        mobilization of global stocks to prevent a default in the London market.
        The system barely held together by shuffling metal across the Atlantic
        and from the Far East to plug the holes in London's balance sheet.
      </p>

      <h3 className="text-2xl font-semibold text-white mb-4 mt-8">
        3.3 Shanghai: The Vacuum in the East
      </h3>

      <p className="text-silver-300 leading-relaxed mb-6">
        While London scrambled to find metal, Shanghai was being drained. The
        Shanghai Gold Exchange (SGE) and Shanghai Futures Exchange (SHFE) saw
        inventories collapse to decade lows, driven by the country's massive
        industrial engine.
      </p>

      <ul className="space-y-4 text-silver-300 mb-6">
        <li className="flex items-start gap-3">
          <span className="text-blue-400 mt-1">•</span>
          <span>
            <strong className="text-white">Record SGE Withdrawals:</strong> In
            October 2025 alone, a staggering 387 tonnes of silver were
            physically withdrawn from the SGE.
            <Cite n={1} /> This represents industrial users taking possession of
            metal to ensure production continuity for solar panels and
            electronics.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-blue-400 mt-1">•</span>
          <span>
            <strong className="text-white">Inventory Levels:</strong> Combined
            inventory across Chinese exchanges fell to roughly 531 tonnes
            (531,211 kg) by late 2025, the lowest level since 2015.
            <Cite n={26} />
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-blue-400 mt-1">•</span>
          <span>
            <strong className="text-white">The Shanghai Premium:</strong> Due to
            this scarcity, silver in Shanghai traded at a persistent premium to
            London and New York. This premium reached as high as 10-15% over
            international spot prices, creating a one-way valve: metal flowed
            into China for consumption, and only flowed out when prices were
            astronomically high or politically directed to ease Western
            squeezes.
            <Cite n={9} />
          </span>
        </li>
      </ul>

      <p className="text-silver-300 leading-relaxed">
        The dynamic in late 2025 was clear: China was consuming silver at a
        voracious rate for its solar and EV industries, depleting its domestic
        stocks and forcing it to compete aggressively for global supply, thereby
        setting the floor for global prices.
      </p>
    </section>

    {/* Section 4: Geopolitical Pivot */}
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-white mb-6">
        4. The Geopolitical Pivot: Silver as a Strategic Weapon
      </h2>

      <p className="text-silver-300 leading-relaxed mb-6">
        In 2025, silver graduated from being a mere commodity to a matter of
        national security. The geopolitical tensions between the United States
        and China began to manifest directly in the silver market, further
        tightening supply.
      </p>

      {/* Global Silver Tug-of-War */}
      <div className="my-10">
        <img
          src="/press/press_1/4.jpeg"
          alt="Global Silver Tug-of-War: USA vs China"
          className="w-full rounded-2xl border border-white/10"
        />
      </div>

      <h3 className="text-2xl font-semibold text-white mb-4 mt-8">
        4.1 US Critical Mineral Designation
      </h3>

      <p className="text-silver-300 leading-relaxed mb-6">
        In late 2025, the United States Department of the Interior, through the
        U.S. Geological Survey (USGS), officially added silver to the Critical
        Minerals List.
        <Cite n={28} /> This designation is reserved for minerals that are
        essential to the economic or national security of the U.S. and have a
        supply chain vulnerable to disruption.
      </p>

      <p className="text-silver-300 leading-relaxed mb-6">
        This policy shift has massive implications for the market:
      </p>

      <ul className="space-y-4 text-silver-300 mb-6">
        <li className="flex items-start gap-3">
          <span className="text-blue-400 mt-1">•</span>
          <span>
            <strong className="text-white">Government Support:</strong> It opens
            the door for federal funding, tax incentives, and streamlined
            permitting for domestic silver mining projects, acknowledging that
            reliance on foreign silver is a strategic vulnerability.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-blue-400 mt-1">•</span>
          <span>
            <strong className="text-white">Stockpiling:</strong> It creates the
            legal framework for the US government to potentially build a
            strategic stockpile of silver for defense and energy needs, adding a
            new, price-insensitive buyer to the market.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-blue-400 mt-1">•</span>
          <span>
            <strong className="text-white">Supply Chain Security:</strong> It
            signals to US manufacturers (defense, aerospace, energy) that they
            must secure non-adversarial sources of silver, potentially
            bifurcating the global market into "Western" and "Eastern" supply
            chains.
          </span>
        </li>
      </ul>

      <h3 className="text-2xl font-semibold text-white mb-4 mt-8">
        4.2 China's Export Controls: The "Rare Earth" Playbook
      </h3>

      <p className="text-silver-300 leading-relaxed mb-6">
        Simultaneously, China moved to ring-fence its own silver supply. The
        Ministry of Commerce announced that effective January 1, 2026, silver
        exports would be subject to a strict licensing regime.
        <Cite n={4} />
      </p>

      <p className="text-silver-300 leading-relaxed mb-6">
        Under the new rules:
      </p>

      <ul className="space-y-4 text-silver-300 mb-6">
        <li className="flex items-start gap-3">
          <span className="text-blue-400 mt-1">•</span>
          <span>
            <strong className="text-white">Quotas and Licenses:</strong> Only
            companies with specific licenses are permitted to export silver. The
            list of approved exporters was restricted to approximately 44 firms,
            primarily large state-owned enterprises.
            <Cite n={4} />
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-blue-400 mt-1">•</span>
          <span>
            <strong className="text-white">Strategic Resource:</strong> Chinese
            state media and industry insiders began referring to silver as a
            "strategic resource," explicitly comparing the new controls to
            China's historical management of Rare Earth elements.
            <Cite n={1} />
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-blue-400 mt-1">•</span>
          <span>
            <strong className="text-white">Impact:</strong> China is the world's
            third-largest silver producer and a major refiner. By restricting
            exports, Beijing is effectively prioritizing domestic industrial
            needs (solar panels, EVs) over the global market. This policy
            exacerbated the global shortage in Q4 2025, as Western buyers rushed
            to front-run the implementation of these rules.
          </span>
        </li>
      </ul>

      <p className="text-silver-300 leading-relaxed">
        The synchronization of these policies—US designation and Chinese
        restriction—confirmed that the world's superpowers now view silver not
        as a currency, but as a critical component of 21st-century technological
        supremacy.
      </p>
    </section>

    {/* Section 5: Industrial Demand */}
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-white mb-6">
        5. Industrial Demand: The Unstoppable Engine
      </h2>

      <p className="text-silver-300 leading-relaxed mb-6">
        While investment demand creates volatility, industrial demand creates
        the price floor. In 2025, three sectors drove industrial consumption to
        record heights: Solar Photovoltaics (PV), Electric Vehicles (EVs), and
        Artificial Intelligence (AI).
      </p>

      <h3 className="text-2xl font-semibold text-white mb-4 mt-8">
        5.1 The Solar Singularity: Technology Shifts
      </h3>

      <p className="text-silver-300 leading-relaxed mb-6">
        The solar industry remains the leviathan of silver consumption. In 2024
        and 2025, the industry underwent a massive technological transition from
        PERC (Passivated Emitter and Rear Cell) technology to TOPCon (Tunnel
        Oxide Passivated Contact) and HJT (Heterojunction) cells.
      </p>

      <p className="text-silver-300 leading-relaxed mb-6">
        Crucially, these newer, more efficient technologies require
        significantly more silver paste per watt of energy produced. TOPCon
        cells use approximately 50% more silver than PERC cells, and HJT cells
        use nearly double.
        <Cite n={2} />
      </p>

      <ul className="space-y-4 text-silver-300 mb-6">
        <li className="flex items-start gap-3">
          <span className="text-blue-400 mt-1">•</span>
          <span>
            <strong className="text-white">Thrifting Limits:</strong> For years,
            manufacturers successfully "thrifted" silver (used less per unit) to
            offset rising demand. However, 2025 highlighted the physical limits
            of this thrifting. To achieve higher efficiencies, more silver is
            required. The "Jevons Paradox" took effect: as solar energy became
            cheaper and more efficient due to these new cells, total demand for
            solar installations exploded, overwhelming the per-unit savings of
            thrifting.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-blue-400 mt-1">•</span>
          <span>
            <strong className="text-white">China's Dominance:</strong> China
            installed record gigawatts of solar capacity in 2025, driving the
            massive withdrawals from Shanghai vaults discussed earlier.
          </span>
        </li>
      </ul>

      <h3 className="text-2xl font-semibold text-white mb-4 mt-8">
        5.2 The Electrification of Transport
      </h3>

      <p className="text-silver-300 leading-relaxed mb-6">
        The EV revolution continued to act as a secondary engine of demand. An
        electric vehicle consumes up to 2-3 times more silver than an internal
        combustion engine (ICE) vehicle.
        <Cite n={2} /> Silver is used heavily in the battery management systems,
        extensive cabling, and the myriad of electronic control units that
        govern modern EVs. With global EV penetration rising, particularly in
        China and Europe, the automotive sector's claim on annual silver supply
        continued to grow, shifting from a niche source of demand to a pillar of
        the market.
      </p>

      <h3 className="text-2xl font-semibold text-white mb-4 mt-8">
        5.3 AI and the Compute Cycle
      </h3>

      <p className="text-silver-300 leading-relaxed">
        A nascent but rapidly growing source of demand in 2025 was the AI
        hardware boom. Data centers, high-performance computing chips, and 5G
        infrastructure all rely on silver's unmatched conductivity. As the "AI
        Arms Race" between the US and China intensified, demand for high-end
        connectors and semiconductor packaging—all containing silver—surged.
        While smaller in tonnage than solar, this demand is highly
        price-inelastic; a $100 increase in the price of silver is negligible
        for a $30,000 AI server rack, meaning this sector will continue to buy
        regardless of price.
        <Cite n={2} />
      </p>
    </section>

    {/* Section 6: The Gamma Squeeze */}
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-white mb-6">
        6. The "Gamma Squeeze" and Investment Flows
      </h2>

      <p className="text-silver-300 leading-relaxed mb-6">
        While fundamentals loaded the gun, the derivatives market pulled the
        trigger. The explosive rally in December 2025 was amplified by a "gamma
        squeeze" in the options market, centered on the iShares Silver Trust
        (SLV).
      </p>

      <h3 className="text-2xl font-semibold text-white mb-4 mt-8">
        6.1 The Mechanics of the Gamma Squeeze
      </h3>

      <p className="text-silver-300 leading-relaxed mb-6">
        As silver prices began to rise in Q4, retail and institutional investors
        piled into call options on SLV.
        <Cite n={36} /> Options dealers (Market Makers), who sell these calls,
        are inherently short the market. To hedge their risk, they must buy the
        underlying asset (SLV shares or silver futures) as the price rises—a
        process known as "delta hedging."
      </p>

      <p className="text-silver-300 leading-relaxed mb-6">
        As the price accelerates, the "delta" of these options increases,
        forcing dealers to buy more silver to remain hedged. This creates a
        feedback loop: Buying drives prices up → Delta increases → Dealers buy
        more to hedge → Prices go up further. In December 2025, this loop went
        vertical. Market data indicates massive activity in SLV options, with
        speculators targeting deep out-of-the-money strikes that quickly became
        in-the-money.
        <Cite n={36} /> This mechanical buying forced billions of dollars into
        the silver market in a matter of weeks, creating a vertical price
        ascent.
      </p>

      <h3 className="text-2xl font-semibold text-white mb-4 mt-8">
        6.2 ETF Inflows: The Return of the Western Investor
      </h3>

      <p className="text-silver-300 leading-relaxed mb-6">
        After years of apathy and net outflows, Western investors returned to
        silver ETFs with a vengeance.
      </p>

      <ul className="space-y-4 text-silver-300">
        <li className="flex items-start gap-3">
          <span className="text-blue-400 mt-1">•</span>
          <span>
            <strong className="text-white">SLV Inflows:</strong> The largest
            silver ETF, SLV, saw net inflows of approximately $2.3 billion in
            2025.
            <Cite n={1} />
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-blue-400 mt-1">•</span>
          <span>
            <strong className="text-white">Physical Trusts:</strong> Fully
            allocated trusts like Sprott Physical Silver Trust (PSLV) and
            Aberdeen (SIVR) also recorded hundreds of millions in inflows,
            removing large 1,000-ounce bars directly from the commercial market.
            <Cite n={40} />
          </span>
        </li>
      </ul>

      <p className="text-silver-300 leading-relaxed mt-4">
        This resurgence of Western investment demand clashed with the physical
        shortage in the East, creating the competition for ounces that drove
        lease rates and premiums to record highs.
      </p>
    </section>

    {/* Section 7: The Debasement Trade */}
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-white mb-6">
        7. The "Debasement Trade": Monetary Context
      </h2>

      <p className="text-silver-300 leading-relaxed mb-6">
        The silver rally did not occur in a vacuum. It was part of a broader
        "debasement trade"—a global move into hard assets to protect against
        currency inflation and fiscal profligacy.
      </p>

      <h3 className="text-2xl font-semibold text-white mb-4 mt-8">
        7.1 The Dollar and Debt
      </h3>

      <p className="text-silver-300 leading-relaxed mb-6">
        Throughout 2025, concerns regarding US fiscal sustainability mounted.
        With the US debt-to-GDP ratio climbing and interest expensed on debt
        consuming a larger portion of the federal budget, the market began to
        price in a long-term devaluation of the US dollar.
        <Cite n={1} /> Investors viewed silver not just as an industrial
        commodity, but as an "inflation-proof" monetary asset. The correlation
        between silver and real interest rates, which had broken down in
        previous years, reasserted itself. Expectations of Federal Reserve rate
        cuts in 2026 further fueled the fire, as lower yields reduce the
        opportunity cost of holding non-yielding assets like gold and silver.
        <Cite n={43} />
      </p>

      <h3 className="text-2xl font-semibold text-white mb-4 mt-8">
        7.2 Central Bank Diversification
      </h3>

      <p className="text-silver-300 leading-relaxed">
        While Central Banks primarily buy gold, their aggressive accumulation of
        precious metals in 2025 signaled a broader move away from fiat reserves.
        The People's Bank of China (PBoC) and the Reserve Bank of India (RBI)
        were notable buyers of gold, creating a "halo effect" that lifted
        silver. Furthermore, reports surfaced of Russia accumulating silver
        reserves, a rare move that hinted at the potential remonetization of the
        white metal in the BRICS bloc.
        <Cite n={45} />
      </p>
    </section>

    {/* Section 8: Conclusion */}
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-white mb-6">
        8. Conclusion: The New Reality at $50
      </h2>

      <p className="text-silver-300 leading-relaxed mb-6">
        The 2025 silver market was defined by the collision of unstoppable force
        (industrial demand) and immovable object (inelastic supply). The
        Christmas Rally to $84 was the market's first attempt to find a price
        that would equilibrate this imbalance. While the subsequent crash to
        ~$70 was painful for late entrants, it did not alter the fundamental
        reality.
      </p>

      <div className="bg-gradient-to-br from-blue-500/10 to-violet-500/10 border border-white/10 rounded-2xl p-8 mb-8">
        <h3 className="text-xl font-semibold text-blue-400 mb-4">
          Key Takeaways
        </h3>
        <ul className="space-y-3 text-silver-300">
          <li className="flex items-start gap-3">
            <span className="text-blue-400 mt-1">•</span>
            <span>
              <strong className="text-white">The Floor has Moved:</strong> The
              days of $20 or $30 silver are likely over. The structural
              inputs—mining costs, solar demand, and physical scarcity—suggest
              that $50 is the new valuation floor for 2026.
              <Cite n={1} />
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-400 mt-1">•</span>
            <span>
              <strong className="text-white">Volatility is the Norm:</strong>{" "}
              Silver is a small, illiquid market compared to gold. The violence
              of the Christmas Rally and Crash demonstrates that volatility is a
              feature, not a bug. Investors must be prepared for 10-20% swings
              in both directions.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-400 mt-1">•</span>
            <span>
              <strong className="text-white">Physical Matters:</strong> The
              disconnect between paper and physical markets means that owning
              physical metal (or fully allocated trusts) is safer than holding
              leveraged paper contracts, which are subject to margin hikes and
              regulatory intervention.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-400 mt-1">•</span>
            <span>
              <strong className="text-white">The Squeeze is Structural:</strong>{" "}
              The deficits are cumulative. The billion ounces lost since 2019
              cannot be replaced quickly. As long as the green energy transition
              accelerates, the squeeze on silver inventories will persist.
              <Cite n={47} />
            </span>
          </li>
        </ul>
      </div>
    </section>

    {/* Section 9: 2026 Outlook */}
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-white mb-6">
        9. 2026 Outlook: What to Watch
      </h2>

      <p className="text-silver-300 leading-relaxed mb-6">
        As we enter 2026, the market remains in a precarious state of balance.
        The following indicators will determine the next major move:
      </p>

      <h3 className="text-2xl font-semibold text-white mb-4 mt-8">
        9.1 Price Targets and Support
      </h3>

      <ul className="space-y-4 text-silver-300 mb-6">
        <li className="flex items-start gap-3">
          <span className="text-blue-400 mt-1">•</span>
          <span>
            <strong className="text-white">Bear Case:</strong> A technical
            pullback could retest the breakout levels at $50-$54. If industrial
            demand softens due to a global recession, prices could consolidate
            in this range.
            <Cite n={5} />
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-blue-400 mt-1">•</span>
          <span>
            <strong className="text-white">Base Case:</strong> Most analysts see
            silver stabilizing between $60 and $75, digesting the massive gains
            of 2025.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-blue-400 mt-1">•</span>
          <span>
            <strong className="text-white">Bull Case:</strong> With the
            gold-to-silver ratio still elevated historically (57:1 vs historical
            15:1), and industrial shortages intensifying, banks like Citi have
            issued targets as high as $110 per ounce for late 2026.
            <Cite n={43} />
          </span>
        </li>
      </ul>

      <h3 className="text-2xl font-semibold text-white mb-4 mt-8">
        9.2 The Watchlist for Retail Investors
      </h3>

      <ul className="space-y-4 text-silver-300 mb-6">
        <li className="flex items-start gap-3">
          <span className="text-blue-400 mt-1">•</span>
          <span>
            <strong className="text-white">SGE Withdrawals:</strong> Monitor the
            monthly withdrawal data from Shanghai. If China continues to drain
            300+ tonnes a month, Western markets will break again.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-blue-400 mt-1">•</span>
          <span>
            <strong className="text-white">COMEX Registered Stocks:</strong>{" "}
            Watch if inventories stabilize or continue to bleed. A drop below 30
            million ounces in registered stocks would signal a critical
            emergency.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-blue-400 mt-1">•</span>
          <span>
            <strong className="text-white">ETF Flows:</strong> Sustained inflows
            into SLV and PSLV act as a vacuum for commercial bars. If 2026 sees
            continued retail buying, the price must rise to ration demand.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-blue-400 mt-1">•</span>
          <span>
            <strong className="text-white">China's Export Policy:</strong>{" "}
            Implementation of the Jan 1, 2026 export controls. Any signs of
            strict enforcement or reduced quotas will send shockwaves through
            the supply chain.
            <Cite n={4} />
          </span>
        </li>
      </ul>

      <div className="bg-gradient-to-br from-blue-500/10 to-violet-500/10 border border-white/10 rounded-2xl p-8">
        <h3 className="text-xl font-semibold text-white mb-4">Final Verdict</h3>
        <p className="text-silver-300 leading-relaxed">
          The "Christmas Rally" of 2025 was a warning shot. It demonstrated that
          the physical silver market is running on fumes. For the strategic
          investor, the repricing of silver is not a completed event, but an
          ongoing process of realization that the world's most indispensable
          industrial metal is running out.
        </p>
      </div>

      <p className="text-silver-500 text-sm mt-8 italic">
        (Note to Reader: This report aggregates data from the Silver Institute,
        COMEX, LBMA, and SGE reports as of year-end 2025. All financial
        investments carry risk, and silver is historically one of the most
        volatile asset classes.)
      </p>
    </section>

    {/* Works Cited */}
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-white mb-6">Works Cited</h2>

      <div className="bg-background-secondary/30 border border-white/10 rounded-2xl p-8">
        <ol className="space-y-4 text-silver-400 text-sm list-decimal list-inside">
          <li>Silver Analysis 2025 DRAFT.docx</li>
          <li>
            <a
              href="https://discoveryalert.com.au/silver-supply-deficit-causes-impact-2025/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Silver Supply Deficit: 5-Year Shortage Reaches 800M Ounces
            </a>
            , Discovery Alert, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://tradingeconomics.com/china/exports/news/513518"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              China to Restrict Silver Shipments Starting New Year
            </a>
            , Trading Economics, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://rareearthexchanges.com/news/chinas-exclusive-export-list-for-critical-metals-2026-2027-whos-in-and-why-it-matters/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              China's Exclusive Export List for Critical Metals (2026-2027):
              Who's In and Why It Matters
            </a>
            , Rare Earth Exchanges, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://www.forex.com/ie/news-and-analysis/silver-2026-outlook-the-trade-to-watch/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Silver 2026 outlook: The trade to watch
            </a>
            , FOREX.com, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://www.marketbeat.com/originals/hi-ho-silver-away-silver-breaks-80-as-poor-mans-gold-explodes/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Hi Ho Silver Away! Silver Breaks $80 as Poor Man's Gold Explodes
            </a>
            , MarketBeat, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://nai500.com/blog/2026/01/gold-and-silver-outlook-2026-can-the-frenzy-continue/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Gold and Silver Outlook 2026: Can the Frenzy Continue?
            </a>
            , NAI 500, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://www.advisorperspectives.com/dshort/updates/2026/01/02/s-p-500-snapshot-index-posts-16-4-gain-in-2025"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              S&P 500 Snapshot: Index Posts 16.4% Gain in 2025
            </a>
            , Advisor Perspectives, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://sdbullion.com/blog/silver-79-gold-4500-surge-china-premium-gap-shanghai-gold-exchange"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Silver and Platinum Surge as Chinese Price Premiums Gap Up
            </a>
            , SD Bullion, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://nai500.com/blog/2025/12/peter-krauth-silver-prices-could-reach-125-in-2026/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Peter Krauth: Silver Prices Could Reach $125 in 2026
            </a>
            , NAI 500, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://m.economictimes.com/news/international/us/silver-price-hits-70-per-ounce-as-historic-rally-accelerates-with-silver-up-over-140-in-2025-can-it-sustain-heres-what-the-silver-price-surge-means-for-investors-now/articleshow/126143470.cms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Silver price hits $70 per ounce as historic rally accelerates
            </a>
            , The Economic Times, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://seekingalpha.com/news/4536083-silver-slides-on-new-years-eve-after-a-record-rally-in-2025"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Silver slides on New Year's Eve after a record rally in 2025
            </a>
            , Seeking Alpha, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://www.investopedia.com/gold-and-silver-prices-plunged-monday-after-big-rally-here-is-why-precious-metals-11877050"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Gold and Silver Prices Plunged Monday After Last Week's Big Rally.
              Here's Why.
            </a>
            , Investopedia, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://www.financemagnates.com/trending/why-silver-is-falling-with-gold-and-why-robert-kiyosaki-predicts-a-200-price-by-2026/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Why Silver Is Falling With Gold and Why Robert Kiyosaki Predicts a
              $200 Price by 2026
            </a>
            , Finance Magnates, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://www.bullionvault.com/gold-news/gold-price-news/gold-silver-china-solar-deficit-122920251"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Gold Sinks $200, Silver -14% from China's Christmas Chaos
            </a>
            , BullionVault, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://discoveryalert.com.au/real-silver-squeeze-2025-market-stress-analysis/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Real Silver Squeeze: Industrial Demand Drives Triple-Digit Price
              Potential
            </a>
            , Discovery Alert, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://silverinstitute.org/the-silver-market-is-on-course-for-fifth-successive-structural-market-deficit/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              The Silver Market is on Course for Fifth Successive Structural
              Market Deficit
            </a>
            , The Silver Institute, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://www.moneymetals.com/uploads/content/World_Silver_Survey-2025-Silver-Supply-and-Demand.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Market Balance Silver Supply and Demand
            </a>
            , Money Metals, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://silverinstitute.org/silver-supply-demand/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              SILVER SUPPLY & DEMAND
            </a>
            , The Silver Institute, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://silverinstitute.org/silver-industrial-demand-reached-a-record-680-5-moz-in-2024/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Silver Industrial Demand Reached a Record 680.5 Moz in 2024
            </a>
            , The Silver Institute, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://bulliontradingllc.com/blog/silver-supply-tightness-2025/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Silver Supply Tightness 2025: Why Record Prices Reflect Seven
              Years of Structural Deficits
            </a>
            , Bullion Trading LLC, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://discoveryalert.com.au/london-bullion-vaults-silver-inflows-2025/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              London Bullion Vaults Silver Inflows Surge to Historic 54 Million
              Ounces
            </a>
            , Discovery Alert, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://nai500.com/blog/2025/10/silver-soars-to-unprecedented-highs-shattering-45-year-record/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Silver Soars to Unprecedented Highs, Shattering 45-Year Record
            </a>
            , NAI 500, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://www.gulftoday.ae/business/2026/01/03/after-stellar-2025-rally-gold-and-silver-may-extend-gains-in-2026"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              After stellar 2025 rally, gold and silver may extend gains in 2026
            </a>
            , Gulf Today, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://inproved.com/silver-s-split-screen-record-shanghai-withdrawals-10-year-low-vaults-and-a-calm-surface-hiding-tight-supply"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Silver's Split-Screen: Record Shanghai Withdrawals, 10-Year Low
              Vaults
            </a>
            , InProved, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://www.usagold.com/silver-rockets-to-57-record-shanghai-inventories-hit-10-year-low/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Silver Rockets To $57 Record — Shanghai Inventories Hit 10-Year
              Low
            </a>
            , USAGOLD, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://www.octafx.com/markets/news/view/1187044/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Chinese Silver stocks hit 10-year low – ING
            </a>
            , Octa, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://apollosilver.com/silver-added-to-usgs-2025-list-of-critical-minerals/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Silver Added to USGS 2025 List of Critical Minerals
            </a>
            , Apollo Silver, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://www.bhfs.com/insight/critical-update-usgs-expands-mineral-list/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Critical Update! USGS Expands Mineral List
            </a>
            , Brownstein, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://www.federalregister.gov/documents/2025/11/07/2025-19813/final-2025-list-of-critical-minerals"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Final 2025 List of Critical Minerals
            </a>
            , Federal Register, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://discoveryalert.com.au/china-silver-export-restrictions-impact-2025/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              China Silver Export Restrictions Transform Global Market Dynamics
            </a>
            , Discovery Alert, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://www.icicidirect.com/research/equity/trending-news/china-has-announced-restrictions-on-silver-exports-from-2026"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              China has announced restrictions on silver exports from 2026
            </a>
            , ICICIdirect, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://www.whalesbook.com/news/English/Commodities/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              China's Silver Export Ban Sparks $84 Rally!
            </a>
            , WhalesBook, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://sdbullion.com/blog/50-silver-london-lease-rates-short-squeeze-all-time-highs-gold"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              +$50 per oz Silver as London Lease Rates Signal Short Squeeze
            </a>
            , SD Bullion, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://sprott.com/insights/silver-investment-outlook-mid-year-2025/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Silver Investment Outlook Mid-Year 2025
            </a>
            , Sprott, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://www.tradingview.com/symbols/FX-SLV/ideas/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Ishares Silver Trust Trade Ideas
            </a>
            , TradingView, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://spotgamma.com/the-great-silver-gamma-squeeze/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              The Great Silver Gamma Squeeze
            </a>
            , SpotGamma, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://markets.financialcontent.com/wral/article/marketminute-2025-12-25-betting-on-the-santa-squeeze-unusual-options-activity-surges-as-2025-draws-to-a-close"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Betting on the 'Santa Squeeze': Unusual Options Activity Surges
            </a>
            , Financial Content, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://finviz.com/news/260004/gold-left-behind-as-silver-hikes-132-ytd-the-etf-playbook-for-2026"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Gold Left Behind as Silver Hikes 132% YTD: The ETF Playbook for
              2026
            </a>
            , Finviz, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://sprott.com/investment-strategies/exchange-listed-products/physical-bullion-funds/gold-and-silver/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Sprott Physical Gold and Silver Trust
            </a>
            , Sprott, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://www.webull.com/news/14077450054173696"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Silver Outshines Gold, AI: ETFs Power A Hot 2026 Diversification
              Play
            </a>
            , Webull, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://markets.financialcontent.com/wral/article/marketminute-2026-1-2-gold-and-silver-shatter-records-as-2026-opens-to-a-perfect-storm-of-economic-anxiety"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Gold and Silver Shatter Records as 2026 Opens to a "Perfect Storm"
              of Economic Anxiety
            </a>
            , Financial Content, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://www.kavout.com/market-lens/gold-and-silver-price-forecast-2026-why-precious-metals-hit-record-highs-and-what-comes-next"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Gold and Silver Price Forecast 2026: Why Precious Metals Hit
              Record Highs
            </a>
            , Kavout, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://m.economictimes.com/news/international/us/why-gold-silver-and-copper-prices-are-all-surging-together-heres-the-2026-price-prediction-and-forecast-for-gold-silver-and-copper/articleshow/126160296.cms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Why gold, silver, and copper are all surging together
            </a>
            , The Economic Times, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://goldsilver.com/industry-news/article/silver-price-forecast-predictions/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Silver Price Predictions 2026: After a 120% Surge, What's Next?
            </a>
            , GoldSilver, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://www.fxempire.com/forecasts/article/gold-and-silver-outlook-for-2026-why-hard-assets-may-beat-stocks-1570516"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Gold and Silver Outlook for 2026: Why Hard Assets May Beat Stocks
            </a>
            , FXEmpire, accessed January 5, 2026
          </li>
          <li>
            <a
              href="https://carboncredits.com/silver-price-hits-64-as-supply-deficit-enters-fifth-year-prices-may-reach-100-oz/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Silver Price Hits $64 as Supply Deficit Enters Fifth Year, Prices
              May Reach $100/Oz
            </a>
            , Carbon Credits, accessed January 5, 2026
          </li>
        </ol>
      </div>
    </section>
  </>
);

// Blog post content for "Silver Market Brief: Anatomy of the January 2026 Blow-Off and Reset"
const silverJanuary2026BlowOffContent = (
  <>
    {/* The Core Theme */}
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-white mb-6">
        The Core Theme: The 2026 Debasement Trade
      </h2>

      <p className="text-silver-300 leading-relaxed mb-4">
        The explosive rally in the first four weeks of 2026 was defined by the "debasement trade"—a systemic flight from the U.S. dollar and paper assets toward "hard" stores of value. This trade was fueled by a unique convergence of fiscal instability and political rupture:
      </p>

      <div className="mb-6">
        <h3 className="text-2xl font-semibold text-white mb-4">
          The J.P. Morgan Trigger
        </h3>
        <p className="text-silver-300 leading-relaxed">
          On January 22, 2026, President Trump filed a $5 billion lawsuit against J.P. Morgan and CEO Jamie Dimon, alleging political "debanking".<Cite n={1} /> This unprecedented attack on the nation's largest lender signaled a complete breakdown in the relationship between Washington and Wall Street, sparking fears that the financial system was becoming a tool for political retribution.<Cite n={3} />
        </p>
      </div>

      <div>
        <h3 className="text-2xl font-semibold text-white mb-4">
          Monetary Erasure
        </h3>
        <p className="text-silver-300 leading-relaxed">
          Combined with public criticisms of the Federal Reserve's independence, investors sought insulation in assets that could not be "printed" or frozen. This rotated capital out of overextended AI tech stocks into the metals complex, pushing gold past $5,600, silver past $120 and copper to a record $14,500/ton.
        </p>
      </div>
    </section>

    {/* Emptied silver vault image */}
    <section className="mb-12">
      <div className="my-10">
        <img
          src="/press/press_3/3.jpg"
          alt="Emptied silver vault"
          className="w-full rounded-2xl border border-white/10"
        />
      </div>
    </section>

    {/* The Perfect Storm */}
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-white mb-6">
        The Perfect Storm: Debasement Meets Physical Scarcity
      </h2>

      <p className="text-silver-300 leading-relaxed mb-6">
        The debasement trade did not happen in a vacuum; it collided with the most acute physical silver shortage in history, creating a positive feedback loop that propelled the price to an intraday high of $121.75 on January 29.
      </p>

      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-white mb-4">
          1. The Inventory Free Fall
        </h3>
        <p className="text-silver-300 leading-relaxed">
          In mid-January, a "physical run" on Wall Street saw 33.45 million ounces withdrawn from COMEX registered warehouses in just seven days—a 26% disappearance of deliverable inventory in one week.<Cite n={5} /> By January 27, registered stocks fell to a critical 107.7 million ounces.<Cite n={7} />
        </p>
      </div>

      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-white mb-4">
          2. The Paper System Fracture
        </h3>
        <p className="text-silver-300 leading-relaxed">
          The "paper game" began to collapse as the coverage ratio fell to 14.2% (Registered inventory vs. 760 million ounces of open interest).<Cite n={7} /> With commercial short positions totaling 231 million ounces—over double the available deliverable supply—shorts were trapped in a vertical squeeze.
        </p>
      </div>

      <div>
        <h3 className="text-2xl font-semibold text-white mb-4">
          3. The Eastern Magnet
        </h3>
        <p className="text-silver-300 leading-relaxed">
          Shanghai spot premiums exploded to over +$12/oz above London (LBMA) benchmarks, creating an unstoppable one-way flow of physical metal from West to East.<Cite n={9} /> This prompted LBMA lease rates to spike to 39%, effectively ending the economic viability of short-selling.<Cite n={11} />
        </p>
      </div>
    </section>

    {/* UK & China flags image */}
    <section className="mb-12">
      <div className="my-10">
        <img
          src="/press/press_3/2.jpg"
          alt="UK and China flags"
          className="w-full rounded-2xl border border-white/10"
        />
      </div>
    </section>

    {/* The Pivot */}
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-white mb-6">
        The Pivot: The "Warsh Shock" and the Margin Hammer
      </h2>

      <p className="text-silver-300 leading-relaxed mb-6">
        On January 30, the "debasement trade" hit an abrupt wall through two coordinated catalysts.
      </p>

      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-white mb-4">
          1. The Warsh Nomination
        </h3>
        <p className="text-silver-300 leading-relaxed mb-4">
          President Trump's nomination of Kevin Warsh to succeed Jerome Powell as Fed Chair removed the expectation of a "politicized Fed". Warsh is perceived as a monetary hawk who prioritizes inflation control and Fed independence.
        </p>
        <ul className="space-y-3 text-silver-300">
          <li className="flex items-start gap-3">
            <span className="text-blue-400 mt-1">•</span>
            <span>
              <strong className="text-white">Interest Rate Outlook:</strong> The market immediately priced in higher rates for longer and a potential reduction in the Fed's balance sheet.<Cite n={12} />
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-blue-400 mt-1">•</span>
            <span>
              <strong className="text-white">Currency Rebound:</strong> The U.S. Dollar Index (DXY) surged 0.8% above the 97 mark, crushing the "debasement" narrative and raising the opportunity cost of holding non-yielding metals.
            </span>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="text-2xl font-semibold text-white mb-4">
          2. The CME "Kill Switch"
        </h3>
        <p className="text-silver-300 leading-relaxed mb-4">
          To contain the "metal mania," the CME Group and LBMA implemented a 36% margin hike, which stimulated vigorous market reactions.<Cite n={13} />
        </p>

        {/* Margin Table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm text-silver-300 border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-white font-semibold">Tier</th>
                <th className="text-left py-3 px-4 text-white font-semibold">Old Margin</th>
                <th className="text-left py-3 px-4 text-white font-semibold">New Margin</th>
                <th className="text-left py-3 px-4 text-white font-semibold">Change (%)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5">
                <td className="py-3 px-4">CME Silver Margin</td>
                <td className="py-3 px-4">11%</td>
                <td className="py-3 px-4">15%</td>
                <td className="py-3 px-4 text-red-400">+36.4%</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 px-4">LBMA Silver Margin</td>
                <td className="py-3 px-4">11%</td>
                <td className="py-3 px-4">17%</td>
                <td className="py-3 px-4 text-red-400">+54.5%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-silver-300 leading-relaxed">
          This forced a violent liquidation of levered positions. Silver spot dropped by 36% and silver futures plummeted 31.4% in a single session to settle at $78.53—the worst daily decline since March 1980.
        </p>
      </div>
    </section>

    {/* Bull-bear fight image */}
    <section className="mb-12">
      <div className="my-10">
        <img
          src="/press/press_3/1.jpg"
          alt="Bull vs Bear"
          className="w-full rounded-2xl border border-white/10"
        />
      </div>
    </section>

    {/* Foundation Check */}
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-white mb-6">
        Foundation Check: Is the Silver Bull Dead?
      </h2>

      <p className="text-silver-300 leading-relaxed mb-6">
        Despite the "liquidity-driven washout," the structural foundation of the silver market remains remarkably bullish.<Cite n={13} />
      </p>

      <ul className="space-y-3 text-silver-300">
        <li className="flex items-start gap-3">
          <span className="text-blue-400 mt-1">•</span>
          <span>
            <strong className="text-white">Supply Scarcity:</strong> China's reclassification of silver as a strategic material (effective Jan 1) and its subsequent export controls remain in place, permanently fragmenting global supply.<Cite n={16} />
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-blue-400 mt-1">•</span>
          <span>
            <strong className="text-white">Inelastic Demand:</strong> The photovoltaic (PV) industry requires 120–125 million ounces in 2026 to meet 665 GW of capacity. Silver now represents 29% of solar module costs, yet substitution remains years away from scaling.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-blue-400 mt-1">•</span>
          <span>
            <strong className="text-white">Structural Deficit:</strong> The market enters its fifth consecutive year of deficit, with mine supply unable to respond to prices due to its status as a by-product of base metal mining.
          </span>
        </li>
      </ul>
    </section>

    {/* Consolidation Period */}
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-white mb-6">
        Consolidation Period
      </h2>

      <p className="text-silver-300 leading-relaxed mb-6">
        Using Elliott Wave Theory and the Fibonacci sequence from the foundation low price of $28.31 to the Jan peak $121.75, we identify the support floor for the current consolidation phase.<Cite n={12} />
      </p>

      <ul className="space-y-3 text-silver-300 mb-6">
        <li className="flex items-start gap-3">
          <span className="text-blue-400 mt-1">•</span>
          <span>
            <strong className="text-white">Golden Ratio Support ($64.02):</strong> The 0.618 retracement serves as the critical structural floor for the next three months.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-blue-400 mt-1">•</span>
          <span>
            <strong className="text-white">Psychological Pivot ($75.00):</strong> The 50% retracement level where the market is currently attempting to stabilize.
          </span>
        </li>
      </ul>

      <div className="bg-gradient-to-br from-blue-500/10 to-violet-500/10 border border-white/10 rounded-2xl p-8">
        <h3 className="text-xl font-semibold text-white mb-4">Outlook</h3>
        <p className="text-silver-300 leading-relaxed">
          The "Warsh Shock" has purged the speculative froth from the debasement trade, but it has not resolved the physical shortage. We expect a "base-building" period between $64 and $75 and wait for the structural deficit to reassert price control again.
        </p>
      </div>
    </section>

    {/* Works Cited */}
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-white mb-6">Works cited</h2>

      <div className="bg-background-secondary/30 border border-white/10 rounded-2xl p-8">
        <ol className="space-y-4 text-silver-400 text-sm list-decimal list-inside">
          <li>
            <a href="https://www.bullionvault.com/gold-news/gold-price-news/gold-5000-silver-100-012320261" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Silver $100, Gold $5000 as Trump's 'Rupture' Turns on J.P.Morgan - BullionVault</a>, accessed on January 31, 2026
          </li>
          <li>
            <a href="https://www.bnnbloomberg.ca/business/2026/01/26/trumps-jpmorgan-lawsuit-underscores-his-growing-clash-with-wall-street/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Trump's JPMorgan lawsuit underscores his growing clash with Wall Street - BNN Bloomberg</a>, accessed on January 31, 2026
          </li>
          <li>
            <a href="https://www.thehindu.com/news/international/trump-sues-jpmorgan-for-5-billion-alleges-the-bank-closed-his-accounts-for-political-reasons/article70539926.ece" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Trump sues JPMorgan for $5 billion, alleges the bank closed his accounts for political reasons - The Hindu</a>, accessed on January 31, 2026
          </li>
          <li>
            <a href="https://m.economictimes.com/markets/us-stocks/news/trumps-lawsuit-against-jpmorgan-highlights-rising-tensions-between-wall-street-and-washington/articleshow/127597639.cms" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Trump's lawsuit against JPMorgan highlights rising tensions between Wall Street and Washington</a>, accessed on January 31, 2026
          </li>
          <li>
            <a href="https://www.tradingkey.com/analysis/commodities/metal/261487879-2026-silver-physical-squeeze-strategic-asset-tradingkey" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">2026 Silver Run: When the Paper Game Collapses and Silver ...</a>, accessed on January 31, 2026
          </li>
          <li>
            <a href="https://www.investing.com/analysis/silver-how-structural-deficits-are-setting-up-a-onceinageneration-move-200674048" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Silver: How Structural Deficits Are Setting Up a Once-in-a-Generation Move | Investing.com</a>, accessed on January 31, 2026
          </li>
          <li>
            <a href="https://news.futunn.com/en/post/68085549/120-spot-silver-and-new-york-silver-futures-hit-new" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">$120! Spot silver and New York silver futures hit new highs together ...</a>, accessed on January 31, 2026
          </li>
          <li>
            <a href="https://www.mitrade.com/au/insights/commodity-analysis/precious-metal/beincrypto-XAGUSD-202601291358" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">The Silver Short Squeeze: Only 14% of Futures Are Covered - Mitrade</a>, accessed on January 31, 2026
          </li>
          <li>
            <a href="https://www.youtube.com/watch?v=DgB5_ri0K1w" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Silver Hits $100 in Shanghai | The $12 Arbitrage Gap That Will DRAIN Every Western Vault</a>, accessed on January 31, 2026
          </li>
          <li>
            <a href="https://inproved.com/silver-s-holiday-basis-china-s-premiums-ignite-vaults-drain-and-two-curves-tell-one-story" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Silver's Holiday Basis: China's Premiums Ignite, Vaults Drain, and Two Curves Tell One Story - InProved</a>, accessed on January 31, 2026
          </li>
          <li>
            <a href="https://www.gate.com/news/detail/17256813" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Silver leasing rates surge 39%! Banks refuse to le | MarketWhisper on Gate Square</a>, accessed on January 31, 2026
          </li>
          <li>
            <a href="https://www.canadianminingreport.com/blog/kevin-warsh-fed-chair-nomination-sparks-precious-metals-crash-what-it-means-for-gold-and-silver-investors-in-2026" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Kevin Warsh Fed Chair Nomination: Gold and Silver Crash Today ...</a>, accessed on January 31, 2026
          </li>
          <li>
            <a href="https://m.economictimes.com/markets/commodities/news/cme-raises-gold-silver-margins-after-prices-plunge-to-historical-lows/articleshow/127816113.cms" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">CME raises gold, silver margins after steepest single-day plunges in decades</a>, accessed on January 31, 2026
          </li>
          <li>
            <a href="https://upstox.com/news/market-news/commodities/gold-and-silver-price-crash-why-precious-metals-witnessed-one-of-the-worst-corrections-in-decades-on-friday-january-30/article-188626/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Silver price crash: Why precious metals witnessed one of the worst corrections in decades on Friday, January 30 - Upstox</a>, accessed on January 31, 2026
          </li>
          <li>
            <a href="https://m.economictimes.com/markets/stocks/news/gold-plunges-12-in-biggest-single-day-selloff-key-levels-to-watch-on-budget-day-2026/articleshow/127814942.cms" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Gold plunges 12% in biggest single-day selloff. Key levels to watch on Budget Day 2026</a>, accessed on January 31, 2026
          </li>
          <li>
            <a href="https://discoveryalert.com.au/silver-prices-2026-surge-monetary-precious-metal/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Silver Prices Surpass $100: Supply Chain & Fed Policy - Discovery Alert</a>, accessed on January 31, 2026
          </li>
          <li>
            <a href="https://bullionworld.in/documents/special-articles/2026/Jan-2026/Silver-Elliott-Wave-Journey.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Silver's Elliott Wave Journey: 2026 Correction Ahead ... - Bullion World</a>, accessed on January 31, 2026
          </li>
        </ol>
      </div>
    </section>
  </>
);

export const blogPostsData: BlogPostData[] = [
  {
    id: "silver-january-2026-blow-off-reset",
    title: "Silver Market Brief: Anatomy of the January 2026 Blow-Off and Reset",
    category: "Market Analysis",
    date: "Friday, January 31, 2026",
    mainImage: "/press/press_3/cover.png",
    excerpt:
      "Silver hit $121.75 before crashing 36% in a single session. We dissect the debasement trade, the Warsh Shock, and what the structural deficit means for the consolidation ahead.",
    content: silverJanuary2026BlowOffContent,
  },
  {
    id: "silver-market-brief-100-horizon",
    title: "Silver Market Brief: The $100 Horizon",
    category: "Market Analysis",
    date: "Monday, January 19, 2026",
    mainImage: "/press/press_2/main.jpeg",
    excerpt:
      "Silver futures closed at $97.29, delivering a 7.1% weekly gain. With COMEX inventories at multi-year lows and the BCOM rebalancing complete, we maintain a Bullish (Vertical Phase) outlook targeting $108-$110.",
    content: silverMarketBrief100HorizonContent,
  },
  {
    id: "the-great-silver-paradigm-shift",
    title:
      "The Great Silver Paradigm Shift: A Comprehensive Analysis of the 2025 Market Repricing and the Christmas Rally",
    category: "Market Analysis",
    date: "5 January 2026",
    mainImage: "/press/silver_press_1_main.jpeg",
    excerpt:
      "2025 was the year silver broke free, posting gains of over 140% and hitting an all-time high of ~$84. This comprehensive report analyzes the structural deficits, geopolitical shifts, and industrial demand that drove the historic repricing.",
    content: silverParadigmShiftContent,
  },
];

export default function BlogPost() {
  const { postId } = useParams<{ postId: string }>();
  const post = blogPostsData.find((p) => p.id === postId);

  // Update meta tags for social sharing
  useEffect(() => {
    if (post) {
      // Define meta content based on post ID
      const metaContent =
        post.id === "silver-january-2026-blow-off-reset"
          ? {
              title: "SilverTimes - Anatomy of the January 2026 Blow-Off and Reset",
              description:
                "Silver hit $121.75 before crashing 36% in a single session. We dissect the debasement trade, the Warsh Shock, and what the structural deficit means for the consolidation ahead.",
            }
          : post.id === "silver-market-brief-100-horizon"
          ? {
              title: "SilverTimes - Silver Market Brief EP1",
              description:
                "Silver price continues to surge in 2026. Read on for our January Silver Market Brief.",
            }
          : {
              title: "SilverTimes - The Great Silver Paradigm Shift",
              description:
                "2025 was the year silver broke free. This report offers retail investors and industry observers a data-driven understanding of why silver has evolved into the world's most critical strategic metal.",
            };

      // Update title
      document.title = metaContent.title;

      // Update or create meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement("meta");
        metaDescription.setAttribute("name", "description");
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute("content", metaContent.description);

      // Open Graph meta tags
      const ogTags = [
        {
          property: "og:title",
          content: metaContent.title,
        },
        {
          property: "og:description",
          content: metaContent.description,
        },
        {
          property: "og:image",
          content: `${window.location.origin}${post.mainImage}`,
        },
        { property: "og:url", content: window.location.href },
        { property: "og:type", content: "article" },
      ];

      // Twitter Card meta tags
      const twitterTags = [
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "twitter:title",
          content: metaContent.title,
        },
        {
          name: "twitter:description",
          content: metaContent.description,
        },
        {
          name: "twitter:image",
          content: `${window.location.origin}${post.mainImage}`,
        },
      ];

      // Set OG tags
      ogTags.forEach(({ property, content }) => {
        let tag = document.querySelector(`meta[property="${property}"]`);
        if (!tag) {
          tag = document.createElement("meta");
          tag.setAttribute("property", property);
          document.head.appendChild(tag);
        }
        tag.setAttribute("content", content);
      });

      // Set Twitter tags
      twitterTags.forEach(({ name, content }) => {
        let tag = document.querySelector(`meta[name="${name}"]`);
        if (!tag) {
          tag = document.createElement("meta");
          tag.setAttribute("name", name);
          document.head.appendChild(tag);
        }
        tag.setAttribute("content", content);
      });
    }

    // Cleanup: restore default title when leaving
    return () => {
      document.title = "SilverTimes - It's Silver Time.";
    };
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen bg-background-primary pt-32">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Post Not Found</h1>
          <p className="text-silver-400 mb-8">
            The blog post you're looking for doesn't exist.
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary pt-32">
      <article className="max-w-4xl mx-auto px-4 pb-32">
        {/* Back Link */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-silver-400 hover:text-white transition-colors mb-8"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Blog
        </Link>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-blue-400/80 font-medium">
              {post.category}
            </span>
            <span className="text-sm text-silver-500">•</span>
            <span className="text-sm text-silver-500">{post.date}</span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-8 leading-tight">
            {post.title}
          </h1>

          {/* Main Image */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10">
            <img
              src={post.mainImage}
              alt={post.title}
              className="w-full h-auto"
            />
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-invert prose-lg max-w-none">
          {post.content}
        </div>
      </article>
    </div>
  );
}
