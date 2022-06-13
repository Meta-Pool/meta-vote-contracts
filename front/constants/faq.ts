export interface Question {
    title: string,
    text: string
}
export const FAQ = [

    { 
        title: 'What are the benefits of Meta Yield?',
        text: `<b>For Backers:</b> 
        <ul style="margin-left: 20px">
            <li>Exposure and access to different projects and their tokens</li>
            <li>De-risked backing: backers are not giving away their NEAR tokens to a project, just the staking rewards generated during the lock period. Backers get ALL their NEAR back after the lock period</li>
            <li>Backers get an IOU with the NEAR value of their deposit for backing </li>
        </ul>
        <br>
        <b>For Projects:</b>

        <ul style="margin-left: 20px">
            <li>Get exposure to and funding from the community</li>
            <li>Contribute to and support the decentralization of NEAR</li>
            <li>Accessible channel to distribute their tokens</li>
            <li>Not a price discovery mechanism: projects are getting funding to kickstart the development</li>
        </ul>`
    },
    { 
        title: 'How does Meta Yield work?',
        text: `Meta Yield works with 4 simple steps: 
        <br><br>
        <ol style="margin-left: 20px">
            <li><a href="https://metapool.app/dapp/mainnet/meta/" target="_blank"> Liquid stake $NEAR tokens with Meta Pool </a> and get stNEAR.</li>
            <li>Lock your stNEAR to support crypto-based projects</li>
            <li>Earn new tokens: get tokens from new projects launching on NEAR at seed price</li>
            <li>Recover your NEAR: At the end of the locking period, you recover 100% of your NEAR.</li>
        </ol>
        <br><br>
        Simply said, you can support crypto projects, get rewarded the project's native token and contribute to the growth of the NEAR ecosystem <b> without losing your staked tokens</b>
        <br><br>
        <img src="./example1.png" alt="" />
        <br><br>
        Meanwhile, you can keep track of the project status, and how close they are to their goals.
        <br><br>
        In the short term a secondary market platform will be aggregated to Meta Yield so that backers have the possibility to trade their IOU (contract proving stNEAR commitment to the project) for $NEAR.
        `
    },
    { 
        title: `What does Meta Yield offer to support the project's fundraising campaign?`,
        text: `Meta Yield currently has <b>a pipeline of more than 30 projects</b> (and growing) willing to leverage the unique opportunity the platform provides.
        <br><br>
        Each project landing on Meta Yield for a fundraising campaign will get support from Meta Yield at no cost from a marketing and promotion perspective: 
        <ul style="margin-left: 20px">
            <li>Pre-launch campaign during the 2 weeks prior to launch</li>
            <li>Launch promotion</li>
            <li>Weekly on going promotion during the fundraising time window</li>
        </ul>
        <br><br>
        Additionally we are working with different entities of the NEAR ecosystem that are interested in the opportunity of financially supporting these new projects on NEAR.ment to the project) for $NEAR.
        `
    },
    { 
        title: 'What is the purpose of Meta Yield?',
        text: `<b>Meta Yield</b> is a kickstarter for new projects on NEAR to get funded by the community. It leverages staking to de-risks the financing of these projects:
        <br><br>
        <b>Projects</b> can request an amount of $NEAR that they need to launch their product/dApp. 
        <br><br>
        <b>Backers</b> get the opportunity to back project(s) they like and feel will increase in value over time and be deemed valuable for the NEAR ecosystem and the community. 
        <br><br>
        Backers will receive a certain number (proportional to their support) of the project's native tokens in exchange for supporting the project.
        <br><br>
        In the short term, a secondary market platform will be aggregated to Meta Yield so that bac
        `
    },
    { 
        title: `Who is on the Meta Yield team?`,
        text: `Meta Yield is a project built by the original team behind Meta Pool co-founded by Claudio Cossio and Lucio Tato. 
        <br><br>
        The team is composed of smart contract and frontend developers, backed by the lead team of product, project, and marketing manager. 
        <br><br>
        Meta Pool is the first liquid staking solution for $NEAR and wNEAR token holders on NEAR and Aurora.
        `
    },
    { 
        title: `Has Meta Yield been audited?`,
        text: `Security is one of our top priorities, this is why Meta Yield is in the process of being audited by Blocksec. We will publish the report as soon as it is ready.
        <br><br>
        Meta Pool's Blocksec security audit report is available for <a href="https://metapool.gitbook.io/master/litepaper-1/risks/audits#audit-staking-wnear-with-meta-pool-on-aurora-security-report-v1.-march-20th-2022" target="_blank">download there </a>.
        `
    },
    { 
        title: 'What are the risks for users?',
        text: `Even though the Meta Pool team is curating as much as possible the projects launching a fundraising campaign on Meta Yield, nothing is guaranteed, and there are always risks. 
        <br><br>
        So before diving into financially supporting a project on Meta Yield, here is the first set of questions you have to ask yourself before backing a project are:
        <br><br>

        <ol style="margin-left: 20px">
            <li>Do I understand the project's offering?</li>
            <li>Am I convinced by the Project (product, service, team, roadmap, etc) and its value proposition?</li>
            <li>Do I believe this project will increase in market share, TVL, and token value over time?</li>
            <li>Do I consider that all the above and the reward (project token) is good enough for me to back it?</li>
        </ol>
        <br><br>
        Do your own research (DYOR) before spending your tokens.
        `
    },
    { 
        title: 'Are there any risks for the projects?',
        text: `Projects raising funds on Meta Yield have a low level of risk since they only receive staking rewards from supporters, so they don’t have to lock any kind of token to claim their rewards.
        <br><br>
        The project tokens allocated to the fundraising campaign for backers in exchange for committing their future staking rewards are distributed after a lock period and via a linear release over a period of time defined by the project.
        <br><br>
        <br><br>
        <img src="./example2.png" alt="" />
        <br><br>
        If a project does not reach any funding goal, the stNEAR tokens that backers have committed will be returned to them immediately after the end of the fundraising period.
        `
    },
    { 
        title: 'Why did you decide to create MetaYield?',
        text: `We deeply believe in the importance and value of growing the NEAR ecosystem:
        <ul style="margin-left: 20px">
            <li>More projects (Music, GameFi, DeFi) need to be launched on NEAR</li>
            <li>NEAR is a fast-growing ecosystem and needs new fundraising mechanisms</li>
            <li>stNEAR is a cornerstone token of the NEAR ecosystem economy and we are constantly expanding its utilit</li>
        </ul>
        `
    },
    { 
        title: 'How is money raised for projects?',
        text: `<b>Projects</b> that need to fund their dApp can request an amount of NEAR that they need to launch and finance their product/app.
        <br><br>
        <b>Backers</b> lock their stNEAR for 12 months. Only the staking rewards generated during that lock period are used to back the project(s). 
        <br><br>
        <img src="./example3.png" alt="" />
        <br><br>
        <b>Backers</b> get a receipt (an IOU) for their stNEAR, so they can claim the corresponding underlying NEAR tokens after the project has earned all their rewards.
        <b>Backers</b> get all their NEAR tokens (minus the staking rewards) after the lock period.
        <br><br>
        <b>Backers</b> will receive a certain number of the project's native tokens in exchange for supporting the project. This process follows a vesting plan and depends on the backing and the funding goal reached.
        <br><br>
        <img src="./example4.png" alt="" />
        <br><br>
        As an example, let's talk about Alice, who wants to back a project on Meta Yield with 10 $NEAR:
        <ol style="margin-left: 20px">
            <li>She liquid stakes 10 <b>$</b>NEAR with Meta Pool and gets ~9.246 <b>stNEAR</b></li>
            <li>She deposits her ~9.246 <b>stNEAR</b> to support the fundraising campaign of the project</li>
            <li>After the fundraising campaign is closed, Alice receives a number of project tokens following a vesting plan* depending on her backing and the funding goal reached</li>
            <li>After a lockup period of 12 months, Alice gets ALL her $10 <b>NEAR</b> back</li>
            <li>Only the staking rewards received after the blocking period will be used to fund the project.</li>
        </ol>
        Is there a limit in the contracts so that users cannot finance more? 
        <br><br>
        <i>* The vesting plan is defined by the project. It is generally constituted of a lock period and a linear release period. The total vesting period should not exceed 6 months.</i>
        `
    },
    { 
        title: 'Why do you need Meta Yield if there are launchpads for NEAR and Aurora (Skyward, BocaChica, SmartPad, etc.)?',
        text: `Launchpads are not fulfilling the same goals as Meta Yield. They are different approaches. For us a launchpad that is focused on trading NEAR for another project token is not much different then swapping them on a DEX/AMM. 
        <br><br>
        Meta Yield works as a fundraising mechanism where people can support crypto projects without losing their tokens. We want to build a long term commitment relationship (don't worry it is not marriage) between NEAR token holders and projects. 
        <br><br>
        We believe that supporting projects with NEAR staking rewards is the best way: this offers a long term view on building utility for a project's token instead of just trading it for short term value creation.
        <br><br>
        Besides supporting a project on Meta Yield, NEAR tokens from the backers will make the network more decentralized and censorship-resistant.
        <br><br>
        `
    },
    { 
        title: `Why is the first project you decided to launch another DEX, of which there are many, couldn't you have chosen a more useful one?`,
        text: `<a href="https://pembrock.finance/" target="_blank">PembRock Finance </a> is the first project to have a fundraising campaign on Meta Yield. 
        <br><br>
        PembRock is not another Decentralized Exchange (DEX): PembRock Finance is the first leveraged yield farming project on NEAR! 
        <br><br>
        Lenders earn passive income by depositing their crypto into the vaults which fund liquidity pools, while yield farmers can maximize their profits by opening a leveraged position. 
        <br><br>
        Farming is still in an early stage of development on NEAR Protocol. Supporting this project can open new opportunities to the community, giving different ways to participate in decentralized finances.
        `
    },
    { 
        title: `What steps will be taken to attract people and projects to MetaYield?`,
        text: `It is essential to have exciting projects listed on Meta Yield to guarantee a sustained number of backers. 
        And it is crucial to have a solid community of backers so that projects can successfully raise funds and therefore be attracted to Meta Yield.
        <br><br>
        At the end of the day, it is a "chicken and egg" story: what comes first?
        <br><br>
        At Meta Yield we have opted to build a solid and attractive pipeline of projects to showcase to the NEAR community and attract backers.
        <br><br>
        Meta Yield is also partnering with NEAR ecosystem funds and guilds to support projects on Meta Yield.
        `
    },
    { 
        title: `Why do you think Meta Yield will succeed?`,
        text: `Our approach and strategy is to put NEAR token holders front and center on every product we build on top of a liquid staking asset. 
        <br><br>
        Meta Yield allows NEAR token holders to diversify the benefits of staking their assets and leverage Meta Pool's liquid token stNEAR to give them exposure to new projects coming into the NEAR and Aurora ecosystems.
        <br><br>
        They get to keep their NEAR and support projects or platforms that they believe can bring value to the NEAR Protocol network by only giving away the staking rewards generated by their NEAR token in exchange for the project's tokens.
        <br><br>
        Meta Yield´s goal is to increase the value of the ecosystem and the network by supporting the security and censorship resistance of the NEAR blockchain through staking and for projects to receive NEAR staking rewards.
        `
    },
    { 
        title: `Don't you think a 12 month locking period is being too long given the rather difficult market situation?`,
        text: `Yes, the current market situation is rather difficult. But at the end of the day, like in any financial asset allocation, you need to think and define your objectives, their time-line, and your risk acceptance level. 
        <br><br>
        Personal Finance 101: the less the risk is, the longer the lock period or the less is the benefit.
        <br><br>
        In general and specifically in the current context, launchpad and DEX/AMM can be quite risky for crypto asset owners. 
        <br><br>
        Meta Yield offers a different approach. Meta Yield allows NEAR token holders to diversify the benefits of staking their assets and leverage Meta Pool's liquid token stNEAR to get exposure to new projects coming into the NEAR and Aurora ecosystems with a zero-risk: only the staking rewards of the committed stNEAR are used to back the projects. 
        Backers get all their $NEAR tokens (minus the staking rewards) back after the 12 months lock period (which is quite a short lock period when talking about Personal Finance 101)
        <br><br>
        So if you believe in NEAR in the long term and you have DYOR on the project you want to back, this shouldn't be a problem.
        `
    },
    { 
        title: `What will happen to the project that is being funded if the price of the NEAR token drops a lot?`,
        text: `The funding goals set up by the project are set in $NEAR / stNEAR. So the successful closing of a fundraising campaign is totally independent from the USD value of the $NEAR token.
        <br><br>
        And like for any regular market, timing is a success factor. But the right/perfect timing is rarely, not to say never, attained. 
        <br><br>
        However the project has 2 options to redeem the financial support obtained through the fundraising campaign:
        - Get the staking rewards upfront at a discounted rate. 
        - Wait for the lock period to end before receiving the staking rewards. 
        <br><br>
        This gives the project the opportunity to somehow time the market and eventually wait for better times in terms of USD value of the $NEAR token.
        `
    },
    { 
        title: `How is determined the number of tokens distributed to a specific fundraising goal? Is the state of the market taken into account? What or who determines the amount of tokens to receive for my stNEAR deposited?`,
        text: `
        <ul style="margin-left: 20px">
            <li>Team behind the projec</li>
            <li>Value proposition</li>
            <li>Amount requested</li>
            <li>Current status of the project</li>
        </ul>
        However, even though the Meta Pool team is curating as much as possible the projects launching a fundraising campaign on Meta Yield, nothing is guaranteed, and there are always risks.
        <br><br>
        So before diving into financially supporting a project on Meta Yield, here is the first set of questions you have to ask yourself before backing a project are:
        <br><br>
        <ol style="margin-left: 20px">
            <li>Do I understand the project’s offering?</li>
            <li>Am I convinced by the Project (product, service, team, roadmap, etc) and its value proposition?</li>
            <li>Do I believe this project will increase in market share, TVL, and token value over time?</li>
            <li>Do I consider that all the above and the reward (project token) is good enough for me to back it?</li>
        </ol>
        <b>Do your own research (DYOR) before spending your tokens.</b>
        `
    },
    { 
        title: `Does Meta Yield or the projects take into account what can happen to the price of NEAR when a large number of tokens are locked, and then, after the lockup period, the tokens are instantly unlocked?`,
        text: `
        The $NEAR token price and the locking/unlocking of $NEAR tokens on Meta Yield are a priori 2 totally unrelated events for the following reasons:
        <br><br>
        <ol style="margin-left: 20px">
            <li>The amount of NEAR tokens can be large but not significant compared to the total market cap of NEAR</li>
            <li>The value of NEAR Protocol, ergo its $NEAR token price, goes way beyond projects fundraising on a launchpad like Meta Yield.</li>
        </ol>
        Another way to formulate the question is using the analogy with a simple case of staking/unstaking on Meta Pool: what happens tomorrow if a whale unstakes thousands of $NEAR? <br> 
        Nothing unless that whale sells-off all its $NEAR tokens.
        `
    },
    { 
        title: `What or who determines the amount of tokens to receive for my stNEAR deposited?`,
        text: `It is determined by Meta Pool's protocol for liquid staking.
        <br><br>
        There is a ratio of exchange from $NEAR tokens to stNEAR tokens, and this ratio changes every epoch measured in the NEAR Network.
        <br><br>
        The stNEAR:NEAR tokens ratio grows according to the network staking APY, this is the fundamental mechanism of Meta Pool.
        <br><br>
        But because Meta Pool is accruing the NEAR tokens paid as rewards from single validators, your amount of stNEAR is not increasing.
        <br><br>
        For example, you liquid stake tokens when the value of 1 stNEAR is 1,06 NEAR. With this ratio, by liquid staking 10 $NEAR tokens, you get 9,434 stNEAR tokens. 
        <br><br>
        Since the value of stNEAR in relation to $NEAR is constantly increasing, after a while having 9,434 stNEAR you will get more $NEAR tokens. Let’s say the stNEAR: NEAR ratio has increased and now 1 stNEAR equivalent to 1,08 NEAR. This means that now, your 9,434 stNEAR are worth 10,19 $NEAR (9,434*1,08 = 10,19).
        <br><br>
        For more information about stNEAR and liquid staking,<a href="https://blog.metapool.app/2022/05/12/a-guide-to-stnear-and-liquid-staking-near-native-token/" target="_blank"> please read our Guide to stNEAR and Liquid Staking NEAR Native Tokens </a>.
        `
    },
    { 
        title: `Will there be additional rewards in Meta tokens?`,
        text: `Not considered by the moment, but it can change in the future.
        `
    },
    { 
        title: `What is the secondary market and how will it work?`,
        text: `In the short term, a secondary market platform will be aggregated to Meta Yield so that backers can trade their IOU (contract proving stNEAR commitment to the project).
        <br><br>
        If a backer trades his/her  IOU for $NEAR tokens, what is taken into consideration for that trade is the base amount of $NEAR (staking rewards is not part of that calculation). The backer will get liquidity at a discount in exchange of the IOU.
        <br><br>
        But the Project's native token reward received in exchange for supporting the project is not involved in that specific transaction.
        `
    },
    { 
        title: `Where can I report a bug about Meta Yield?`,
        text: `You can reach our team through metayield@metapool.app or you can mention us through our support channel at <a href="https://discord.gg/qHC9KnJXHM"> Discord </a>: 
        <br><br>
        Keep calm and breath, our team will take care of it.
        `
    },
    { 
        title: `If the fundraising fails, will the project fundraising campaign be restarted?`,
        text: `If the fundraising campaign were to be not successful, backers will get all their stNEAR back immediately after the closing of the fundraising campaign and the native tokens of projects will be returned to projects.
        <br><br>
        The decision of doing another fundraising campaign at a later stage will be up to the project.
        `
    },
    
];