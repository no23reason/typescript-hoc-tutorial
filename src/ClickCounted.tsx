import * as React from 'react';

interface ExternalProps {
    counterClassName?: string;
}

interface State {
    clickCount: number;
}

export interface InjectedProps {
    clickCount: number;
}

export const clickCounted = (debug: boolean = false) =>
    <TOriginalProps extends {}>(
        Component: (React.ComponentClass<TOriginalProps & InjectedProps>
            | React.StatelessComponent<TOriginalProps & InjectedProps>)
    ) => {
        type ResultProps = TOriginalProps & ExternalProps;
        const result = class ClickCounted extends React.Component<ResultProps, State> {
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
                    <div onClick={this.handleClick}>
                        <span className={this.props.counterClassName}>Clicked {this.state.clickCount} times</span>
                        <Component {...this.props} {...this.state} />
                    </div>
                );
            }
        };

        return result;
    };
