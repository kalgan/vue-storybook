const Vue = require("vue").default;
const upperFirst = require("lodash").upperFirst;
const camelCase = require("lodash").camelCase;
const isPlainObject = require("lodash").isPlainObject;

/**
 * Normalizes prop passed from knobs attributes
 * @param {any} prop
 * @returns {Object}
 */
function normalizeProp(prop) {
  if (!isPlainObject(prop)) {
    prop = {
      type: (prop).constructor,
      default: prop
    }
    return prop
  }
  if (prop.default && !prop.type) {
    prop.type = (prop.default).constructor
  }
  return prop
}

function registerStories(req, fileName, sbInstance, plugins, extensions = {}) {
  const {
    action,
    withNotes,
    text,
    boolean,
    number,
    color,
    object,
    array,
    select,
    date,
    withKnobs
  } = plugins;
  const componentConfig = req(fileName);
  const componentDefault = componentConfig.default || componentConfig;

  const stories = componentDefault.__stories;

  if (!stories) return;
  stories.forEach(story => {
    const storiesOf = sbInstance(story.group, module);
    const addFunc = () => {
      let props = story.knobs ? eval(`(${story.knobs})`) : {};
      Object.keys(props).forEach(key => {
        props[key] = normalizeProp(props[key])
      })
      return Object.assign({}, extensions, {
        props,
        template: story.template,
        methods: eval(`(${story.methods})`)
      });
    };

    let addParams = {}

    // Notes Addon
    if (story.notes) {
      storiesOf.addDecorator(withNotes)
      addParams.notes = story.notes
    }

    // Knobs Addon
    story.knobs ? storiesOf.addDecorator(withKnobs) : false;

    storiesOf.add(story.name, addFunc, addParams);

    const componentName = componentDefault.name || upperFirst(
      camelCase(fileName.replace(/^\.\/[\W_]*?/, "").replace(/\.\w+$/, ""))
    );
    Vue.component(componentName, componentDefault);
  });
}

module.exports = registerStories;
