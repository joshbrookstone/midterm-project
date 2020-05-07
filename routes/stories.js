const express = require('express');
const router = express.Router();
const rp = require('request-promise-native');

module.exports = (myDB) => {
  //browse all stories
  router.get('/', (req, res) => {
    const user = req.session.user;

    myDB.browseAllStories(user, 4, 3)
      .then((templateVars) => {
        res.render('stories', templateVars);
      });
  });

  //create a new story
  router.post('/', (req, res) => {
    const authorId = req.session.user;
    const title = req.body.title;
    const content = req.body.content;
    const genre = req.body.genre;

    myDB.newStory(content, title, authorId, genre)
      .then((storyId) => {
        res.redirect(`/stories/${storyId}/contributions`);
      });
  });

  //generate a writing prompt
  router.post('/update', (req, res) => {
    const options = {
      uri: 'https://ineedaprompt.com/dictionary/default/prompt?q=adj+noun+adv+verb+noun+location',
      json: true
    };

    rp(options)
      .then((data) => {
        // console.log(data.english);
        res.json(data);
      })
      .catch((err) => {
        console.log(err);
      });
  });

  // get all stories that are unfinished /stories/unfinished
  router.get('/unfinished', (req, res) => {
    const user = req.session.user;

    myDB.browseUnfinished(user)
      .then((templateVars) => {
        res.render('unfinished', templateVars)
      })
  });

  // get top stories by like
  router.get('/topStories', (req, res) => {
    const user = req.session.user;

    myDB.getTopStories(user)
      .then((templateVars) => {
        res.render('topStories', templateVars)
      });

  });

  // read a complete story
  router.get('/:story_id', (req, res) => {
    const id = req.params.story_id;
    const user = req.session.user;
    const fct = (templateVars) => {
      if (req.session.user) templateVars.loggedIn = true;
      (templateVars.state !== 'Complete') ? res.redirect(`/stories/${templateVars.id}/contributions`) : res.render('story', templateVars);
    };
    myDB.completeStory(user, id)
      .then((templateVars) => {
        fct(templateVars);
      });
  });

  //read an incomplete story
  router.get('/:story_id/contributions', (req, res) => {
    const id = req.params.story_id;
    const user = req.session.user;

    myDB.incompleteStory(user, id)
      .then((templateVars) => {
        if (req.session.user) templateVars.loggedIn = true;
        if (templateVars.state === 'Complete') {
          res.redirect(`/stories/${id}`);
        } else {
          (user === 1) ? res.render('story', templateVars) : res.render('demo_story', templateVars);
        }
      });
  });

  //create a new contribution to a story
  router.post('/:story_id/contributions', (req, res) => {
    const storyId = req.body.story_id;
    const contributor_id = req.session.user;
    const content = req.body.content;

    myDB.newContribution(storyId, content, contributor_id)
      .then((data) => {
        const contributionId = data.rows[0].id;
        return myDB.renderContribution(contributionId);
      })
      .then((data) => {
        const result = JSON.stringify(data.rows[0]);
        res.end(result);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  //append a contribution to a story
  router.post('/:story_id/contributions/:contribution_id', (req, res) => {
    const contributionId = req.params.contribution_id;
    const storyId = req.params.story_id;

    myDB.merge(storyId, contributionId)
    .then(() => {
      res.status(201).send();
    })
  });

  //mark a story complete
  router.post('/:story_id/complete', (req, res) => {
    const storyId = req.body.storyId;

    myDB.storyComplete(storyId)
      .then(() => {
        console.log('Changed story state to complete.');
        res.status(200).send();
      });
  });

  // upvote
  router.post('/contributionupvote', (req,res) => {
    const contributionId = req.body.contId;

    myDB.like(contributionId)
      .then((response) => {
        res.status(200).json({upvotes: response.rows[0].upvotes});
      });

  });
  return router;
};
