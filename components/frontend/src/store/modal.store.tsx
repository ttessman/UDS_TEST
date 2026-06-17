import { createContext, useContext, useReducer, type ReactNode } from "react";

export const SET_ACTIVE_MODAL = "ui/modal/SET_ACTIVE_MODAL";
export const CLEAR_ACTIVE_MODAL = "ui/modal/CLEAR_ACTIVE_MODAL";
export const CLEAR_ALL_MODALS = "ui/modal/CLEAR_ALL_MODALS";

export type ModalId = string;

export interface SetActiveModalAction {
  type: typeof SET_ACTIVE_MODAL;
  payload: { id: ModalId };
}

export interface ClearActiveModalAction {
  type: typeof CLEAR_ACTIVE_MODAL;
  payload?: { id: ModalId };
}

export interface ClearAllModalsAction {
  type: typeof CLEAR_ALL_MODALS;
}

export type ModalActions = SetActiveModalAction | ClearActiveModalAction | ClearAllModalsAction;

export const setActiveModal = (id: ModalId): SetActiveModalAction => ({
  payload: { id },
  type: SET_ACTIVE_MODAL
});

export const clearActiveModal = (id?: ModalId): ClearActiveModalAction => ({
  payload: id ? { id } : undefined,
  type: CLEAR_ACTIVE_MODAL
});

export const clearAllModals = (): ClearAllModalsAction => ({
  type: CLEAR_ALL_MODALS
});

export interface ModalState {
  stack: ModalId[];
}

const initialState: ModalState = { stack: [] };

export function modalReducer(state: ModalState = initialState, action: ModalActions): ModalState {
  switch (action.type) {
    case SET_ACTIVE_MODAL: {
      const id = action.payload.id;

      if (state.stack[state.stack.length - 1] === id) {
        return state;
      }

      return { ...state, stack: [...state.stack.filter((item) => item !== id), id] };
    }
    case CLEAR_ACTIVE_MODAL: {
      if (!action.payload) {
        return state.stack.length === 0 ? state : { ...state, stack: state.stack.slice(0, -1) };
      }

      return { ...state, stack: state.stack.filter((item) => item !== action.payload?.id) };
    }
    case CLEAR_ALL_MODALS:
      return state.stack.length === 0 ? state : { ...state, stack: [] };
    default:
      return state;
  }
}

export const selectActiveModalId = (state: { modal: ModalState }) => state.modal.stack[state.modal.stack.length - 1] ?? null;

export const isModalActive = (id: ModalId) => (state: { modal: ModalState }) => selectActiveModalId(state) === id;

type ModalContextValue = {
  activeModalId: ModalId | null;
  clearModal: (id?: ModalId) => void;
  clearModals: () => void;
  isActive: (id: ModalId) => boolean;
  openModal: (id: ModalId) => void;
};

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, dispatch] = useReducer(modalReducer, initialState);
  const activeModalId = selectActiveModalId({ modal });

  return (
    <ModalContext.Provider
      value={{
        activeModalId,
        clearModal: (id) => dispatch(clearActiveModal(id)),
        clearModals: () => dispatch(clearAllModals()),
        isActive: (id) => activeModalId === id,
        openModal: (id) => dispatch(setActiveModal(id))
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModalController() {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("useModalController must be used within ModalProvider");
  }

  return context;
}

export function useModalSync(id: ModalId) {
  const controller = useModalController();

  return {
    activeModalId: controller.activeModalId,
    closeModal: () => controller.clearModal(id),
    closeTopModal: () => controller.clearModal(),
    isActive: controller.isActive(id),
    openModal: () => controller.openModal(id)
  };
}
