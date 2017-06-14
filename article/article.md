---
title: React Higher-Order Components in TypeScript made simple
published: true
description: Guide to writing React Higher-Order Components in TypeScript
tags: typescript, react, hoc
---

When refactoring a Higher-Order Component (HOC) in a TypeScript project at work, there was some confusion regarding how to write them properly. After a discussion with my friend and colleague [Marek](https://github.com/Murmand), I decided to write this guide for future reference. I hope it helps you too.

## What are HOCs?

As per [the official docs](https://facebook.github.io/react/docs/higher-order-components.html), HOC is
> a higher-order component is a function that takes a component and returns a new component

They are used for extracting patterns common to multiple components into a single place, thus making the code more [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself). The most “famous” HOC is `connect` from the [`react-redux`](https://github.com/reactjs/react-redux) package.

## How to write them?

For the purpose of this article, we will create out own HOC `ClickCounted` that counts the number of clicks and passes that count as a prop to the child component (we call this the *wrapped* component). It also displays the current number of clicks itself and can be styled using the `style` prop, similarly to a `div`. Finally, we can configure whether the component `console.log`s on each click. These attributes were chosen to illustrate all the aspects of HOCs while keeping the HOC as simple as possible.

### Props

There are three types of props we need to consider when creating a HOC: `OriginalProps`, `ExternalProps` and `InjectedProps`.

* `OriginalProps` are props of the wrapped component. They are passed straight through, the HOC does not know anything about them.

* `ExternalProps` are props of the component created by the HOC. They are not passed to the wrapped component. There don't have to be any.

* `InjectedProps` are props that the HOC adds to the wrapped component. They are calculated based on the HOC state and `ExternalProps`. There don't have to be any.

The relations between the prop types are shown on the following diagram

![HOC diagram](https://cdn.rawgit.com/no23reason/typescript-hoc-tutorial/89885489561a7f9105226acdb8a3af655621842f/article/props-diagram.svg)

As we can see, the props of the resulting component are of type `OriginalProps & ExternalProps` (i.e. union of the two).

For our illustrative `ClickCounted` HOC, the prop types are:
```ts
interface ExternalProps {
    style?: React.CSSProperties;
}

export interface InjectedProps {
    clickCount: number;
}
```
The `InjectedProps` need to be exported because we need them when using the HOC (see later). The state of the HOC is simple, just the count of the clicks:
```ts
interface State {
    clickCount: number;
}
```

### Options

As stated before, HOC is a function that takes a component and returns a component.
```ts
Component => Component
```

While this is true, many HOCs take the form of curried HOC factories (like the mentioned `connect` from `react-redux`) that take a configuration object and return a HOC:

```ts
options => Component => Component
```

These options are used to modify the HOC itself providing some *static* configuration values. Note that those values do not have access to the props or states, they are evaluated only once when the HOC factory is called. If you need to interact with props or states from here, the only way to do it is to specify options as functions, that take the props or states as arguments.

For `ClickCounted` the options are simple – a flag indicating whether to `console.log` on click:
```ts
interface Options {
    debug?: boolean;
}
```

## Putting it all together

Having declared all the necessary types, we can write our HOC signature:
```ts
export const clickCounted = ({ debug = false }: Options = {}) =>
    <TOriginalProps extends {}>(
        Component: (React.ComponentClass<TOriginalProps & InjectedProps>
                  | React.StatelessComponent<TOriginalProps & InjectedProps>)
    ) => {
        // body
    }
```

This may seem a bit complex at first glance, but let's dissect it part by part.

```ts
({ debug = false }: Options = {}) =>
```

The first line starts a lambda function, that takes a single argument, that is desctructured into its keys (in this case the `debug` key) while providing the default values for them. This means the caller can call this function either without arguments, or with a single `Options` argument and when a value for a particular key is not provided, the specified default is used.

```ts
<TOriginalProps extends {}>(
        Component: (React.ComponentClass<TOriginalProps & InjectedProps>
                  | React.StatelessComponent<TOriginalProps & InjectedProps>)
    ) =>
```

The second part is a generic lambda function with one type parameter `TOriginalProps` that represents the `OriginalProps` type discussed above. The `extends {}` is only a syntactic noise to specify this is meant to be a generic lambda and not a JSX component tag. The lambda takes only one argument called `Component` (note its name starts with a capital letter, this is intentional, we'll se the reason later in the text) that can be one of two types:

* `React.ComponentClass<TOriginalProps & InjectedProps>` — React class component with props of the `TOriginalProps & InjectedProps` type
* `React.StatelessComponent<TOriginalProps & InjectedProps>` — Functional stateless component with the same props type

The props type corresponds to the diagram where two types of props are passed to the wrapped component. Now that we have the signature, all that's left is to implement the HOC:

```ts
export const clickCounted = ({ debug = false }: Options = {}) =>
    <TOriginalProps extends {}>(
        Component: (React.ComponentClass<TOriginalProps & InjectedProps>
                  | React.StatelessComponent<TOriginalProps & InjectedProps>)
    ) => {
        type ResultProps = TOriginalProps & ExternalProps;
        const result = class ClickCounted extends React.Component<ResultProps, State> {
            static displayName = `ClickCounted(${Component.displayName || Component.name})`;

            constructor(props: ResultProps) {
                super(props);
                this.state = {
                    clickCount: 0,
                };
            }

            handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
                if (debug) {
                    console.log('Clicked');
                }
                this.setState(state => ({ clickCount: state.clickCount + 1 }));
            }

            render(): JSX.Element {
                return (
                    <div onClick={this.handleClick} style={this.props.style}>
                        <span>Clicked {this.state.clickCount} times</span>
                        <Component {...this.props} {...this.state} />
                    </div>
                );
            }
        };

        return result;
    };
```

First, we define the type alias for the resulting component's props – the `TOriginalProps & ExternalProps` to simplify its reuse. Then we define the class of the resulting component as having this type of props and appropriate type of state.

We introduce a static property called `displayName` that helps to identify the component while debugging (in ReactDev tools for example) by telling us the name of the wrapped component as well. Next, we define a simple constructor where we initialise the state.

The `handleClick` method is defined that increments the click count and if `debug` was `true` in `options` it writes a message to console.

Finally, `render` method is specified returning a `div` with `style` prop and a click handler specified. In the div a `span` with the current click count is rendered as well as the wrapped component. This is the reason the `Component` argument starts with a capital letter, otherwise we wouldn't be able to render it like this. Props and state are passed to it with whatever was in the `OriginalProps` along with the `clickCount` from the HOC state.

## Using the HOC

To illustrate how to use our HOC, we create a `Demo` component, that displays a different text depending on the amount of clicks and a custom message
```ts
import { clickCounted, InjectedProps } from './ClickCounted';

interface DemoProps {
    text: string;
}

const DemoComponent = (props: DemoProps & InjectedProps): JSX.Element => {
    return (
        <div>
            <p>{props.text}</p>
            <p>
                {
                    props.clickCount >= 5
                        ? 'Easy there!'
                        : 'Bring it!'
                }
            </p>
        </div>
    );
};

export const Demo = clickCounted()(DemoComponent);
export const DemoWithDebug = clickCounted({ debug: true })(DemoComponent);
```

Notice the type of the `props` argument – it consists of `DemoProps` (i.e. `OriginalProps`) and the `InjectedProps`. That way it can use props passed either from the HOC or the consumer directly.

Then we export two wrapped versions of the component – one without debug logs and one with them. We can then use them like any other component and thanks to TypeScript benefit from nice things like type checking and code completion.

## Conclusion

On a simple example we discussed various aspects of HOCs in TypeScript. There is a [GitHub repository with this demo](https://github.com/no23reason/typescript-hoc-tutorial) where you can download and play with it to familiarise yourself with the concepts better.

Also, all the concepts can be put together to make a simple HOC template (just copy it and fill in the blanks indicated by the comments):
```ts
import * as React from 'react';

// State of the HOC you need to compute the InjectedProps
interface State {
}

// Props you want the resulting component to take (besides the props of the wrapped component)
interface ExternalProps {
}

// Props the HOC adds to the wrapped component
export interface InjectedProps {
}

// Options for the HOC factory that are not dependent on props values
interface Options {
    key?: string;
}

export const yourHocFactoryName = ({ key = 'Default value' }: Options = {}) =>
    <TOriginalProps extends {}>(
        Component: (React.ComponentClass<TOriginalProps & InjectedProps>
            | React.StatelessComponent<TOriginalProps & InjectedProps>)
    ) => {
        // Do something with the options here or some side effects

        type ResultProps = TOriginalProps & ExternalProps;
        const result = class YourComponentName extends React.Component<ResultProps, State> {
            // Define how your HOC is shown in ReactDevTools
            static displayName = `YourComponentName(${Component.displayName || Component.name})`;

            constructor(props: ResultProps) {
                super(props);
                this.state = {
                    // Init the state here
                };
            }

            // Implement other methods here

            render(): JSX.Element {
                // Render all your added markup
                return (
                    <div>
                        {/* render the wrapped component like this, passing the props and state */}
                        <Component {...this.props} {...this.state} />
                    </div>
                );
            }
        };

        return result;
    };
```

I hope this article is useful to you. In case of any questions, feel free to comment.
