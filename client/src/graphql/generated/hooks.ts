/* eslint-disable */
// @ts-nocheck
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
import * as ApolloReactHooks from '@apollo/client/react';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type FormData = {
  __typename?: 'FormData';
  input1?: Maybe<Scalars['String']['output']>;
  input2?: Maybe<Scalars['String']['output']>;
};

export type FormDataInput = {
  input1?: InputMaybe<Scalars['String']['input']>;
  input2?: InputMaybe<Scalars['String']['input']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  saveData: Scalars['Boolean']['output'];
};


export type MutationSaveDataArgs = {
  data: FormDataInput;
};

export type Query = {
  __typename?: 'Query';
  loadData?: Maybe<FormData>;
};

export type LoadDataQueryVariables = Exact<{ [key: string]: never; }>;


export type LoadDataQuery = { __typename?: 'Query', loadData?: { __typename?: 'FormData', input1?: string | null, input2?: string | null } | null };

export type SaveDataMutationVariables = Exact<{
  data: FormDataInput;
}>;


export type SaveDataMutation = { __typename?: 'Mutation', saveData: boolean };


export const LoadDataDocument = gql`
    query LoadData {
  loadData {
    input1
    input2
  }
}
    `;

/**
 * __useLoadDataQuery__
 *
 * To run a query within a React component, call `useLoadDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useLoadDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLoadDataQuery({
 *   variables: {
 *   },
 * });
 */
export function useLoadDataQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<LoadDataQuery, LoadDataQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<LoadDataQuery, LoadDataQueryVariables>(LoadDataDocument, options);
      }
export function useLoadDataLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<LoadDataQuery, LoadDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<LoadDataQuery, LoadDataQueryVariables>(LoadDataDocument, options);
        }
// @ts-ignore
export function useLoadDataSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<LoadDataQuery, LoadDataQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<LoadDataQuery, LoadDataQueryVariables>;
export function useLoadDataSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<LoadDataQuery, LoadDataQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<LoadDataQuery | undefined, LoadDataQueryVariables>;
export function useLoadDataSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<LoadDataQuery, LoadDataQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<LoadDataQuery, LoadDataQueryVariables>(LoadDataDocument, options);
        }
export type LoadDataQueryHookResult = ReturnType<typeof useLoadDataQuery>;
export type LoadDataLazyQueryHookResult = ReturnType<typeof useLoadDataLazyQuery>;
export type LoadDataSuspenseQueryHookResult = ReturnType<typeof useLoadDataSuspenseQuery>;
export type LoadDataQueryResult = Apollo.QueryResult<LoadDataQuery, LoadDataQueryVariables>;
export const SaveDataDocument = gql`
    mutation SaveData($data: FormDataInput!) {
  saveData(data: $data)
}
    `;
export type SaveDataMutationFn = Apollo.MutationFunction<SaveDataMutation, SaveDataMutationVariables>;

/**
 * __useSaveDataMutation__
 *
 * To run a mutation, you first call `useSaveDataMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSaveDataMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [saveDataMutation, { data, loading, error }] = useSaveDataMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useSaveDataMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<SaveDataMutation, SaveDataMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<SaveDataMutation, SaveDataMutationVariables>(SaveDataDocument, options);
      }
export type SaveDataMutationHookResult = ReturnType<typeof useSaveDataMutation>;
export type SaveDataMutationResult = Apollo.MutationResult<SaveDataMutation>;
export type SaveDataMutationOptions = Apollo.BaseMutationOptions<SaveDataMutation, SaveDataMutationVariables>;