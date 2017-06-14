import * as React from 'react';

interface State {
    clickCount: number;
}

interface ExternalProps {
    style?: React.CSSProperties;
}

export interface InjectedProps {
    clickCount: number;
}

interface Options {
    debug?: boolean;
}

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
