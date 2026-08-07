// Content of the note stack. Index 0 is the front note; append to add another
// note behind the others. Only `id` has to be unique — everything else is free
// text, and `body` may contain newlines.
//
// Markup available inside `body`:
//   [label](https://example.com)  link — opens in a new tab, clickable once the
//                                 note is double-clicked open in focus mode
//   # text                        title, ## heading, ### subheading
//   - item                        bullet ("* item" works too)
//   1. item                       numbered ("1) item" works too); the number you
//                                 write is the number shown
//   [ ] item / [x] item           checklist, unticked / ticked

export const formatStamp = (date) =>
  `${date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`

export const notes = [
  {
    id: 'note-1',
    title: 'this site',
    date: formatStamp(new Date()),
    body: 'is a work in progress. i\'m still figuring out its trajectory. for now, i\'ve settled with educating myself through writing about: \n- private tech \n- malleable software \n- energy \n- climate \n- bio(medical)engineered/firmware? products. \n\n project(s) that i\'ve worked on: \n[x] newclear.website \n\ncontents here in order: \n1. FUTO guides \n2. newclear.website \n3. cool stuff \n4. curious',
  },
  {
    id: 'note-2',
    title: 'futo guides',
    date: '3 August 2026 at 12:23',
    body: 'to a self managed life.\n\nbelow are video and written guides to build your own private tech. \n- [video part 1/2](https://youtu.be/Et5PPMYuOc8?si=e-T_ZZ7c-oYmYiOX) \n- [video part 2/2](https://youtu.be/3fW9TV1WQi8?si=9Et1nuaNMPs1V1Xf) \n- [guide](https://wiki.futo.org/index.php/Introduction_to_a_Self_Managed_Life:_a_13_hour_%26_28_minute_presentation_by_FUTO_software)',
  },
  {
    id: 'note-3',
    title: 'newclear.website',
    date: '3 August 2026 at 14:23',
    body: 'a [website](https://newclear.website) on nuclear electricity energy for the average singaporean as singapore is considering its feasibility. \n\n # brief\n the focus is to debunk myths and misconceptions the average singaporean has on nuclear electricity energy as singapore is considering nuclear electricity energy to add into its energy portfolio mix.\n\nthe average singaporean being most singaporeans who can read either at least one of the common languages in singapore: english, chinese, malay, tamil, hindi. considering different ages — mostly older in singapore, above 40 — and colour deficiencies. the goal here is to simply reach as many people, who live in singapore, as possible. \nthus, the design is focused on accessibility, considering: language, font size, colour, wording-content, and minimal-to-little distractions. \n\nthe last point being the lack of interactive or any media that simply pulls the attention away from the main focus aka content; fancy or artsy design just won\'t cut it because it’d only reach a certain demographic which is self-limiting. e.g. comic strip design to relay info may work for the younger-to-working-adult crowd but the older/elderly crowd, whom usually has more misconceptions on nuclear energy, may deem the interactive info as unimportant and be either hesitant or unbothered to entertain the info seriously.\n\n # why\ni started this website because i wanted to work on something bigger than myself whilst convalescing. i read bits and pieces of sources on nuclear electricity energy via books and websites the past few months. \n\nrecently, i realised this experiment is more selfish than i believed. personally, i have a dream life which would require loads of technological interaction which would need loads of electricity, and the cheapest option in the long-term currently is nuclear electricity energy. so whilst trying to participate in something bigger than myself, i end up acting on my self-interest and building something disguised as good for my community — what a selfish prick i am haha. \n\n# me \nin some twisted turn, i guess this experiment exposed details about me which i’d not have found had i not done this (project/experiment).\n\ni learnt that i care more about my society and i’m more sensitive than i care to admit despite the selfish prick realisation.',
  },
  {
    id: 'note-4',
    title: 'cool stuff',
    date: formatStamp(new Date()),
    body: '# bio products \n ## augmental \n1. VOX. 11 grams skin contact microphone with built in physical programmable buttons, dictate into any text box without worrying about audio recording and surrounding noise. an invisible keyboard. \n 2. mouthpad. a custom-fit mouthpiece that turns subtle tongue and head movements into precise control of most devices. an invisible [mouse](https://www.augmental.tech). \n\n## neuralink \nactions from translated neural signals with brain-computer interfaces. control computers and robotic arms with [thoughts](https://neuralink.com). \n\n ## sunday.ai \nhelpful home [robot](https://www.sunday.ai). consciously designed for homes. \n\n # future \nif i could be so bold to predict the future and/or eventually aid in the development for future tech, i would partake in this route. creating products and solving real problems for health and lifestyle. i imagine a world where we use our tongues for keyboards and mouse with a less complicated setup in the mouth, allowing us to sip water whilst working, and glasses for computer interfaces aka monitor. unless facing a health issue, i wouldn\'t recommend an operation to place a chip in the brain. robots can help us with our mundane and repetitive tasks, though those tasks can sometimes be relieving, but that\'s another conversation.',
  },
  {
    id: 'note-5',
    title: 'curious',
    date: formatStamp(new Date()),
    body: '# software \nfound [ink & switch](https://inkandswitch.com) a few months back and thought its values were interesting. \n1. local-first \n2. malleable \n3. programmable ink \n4. universal version control. \n\n i understood local-first and version control to a certain technical degree but malleable and programming ink were foreign values to me. i wish to venture more into these concepts. \n\n# studies \nengineering genetic circuits \n1. design',
  },
]
