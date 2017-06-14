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
