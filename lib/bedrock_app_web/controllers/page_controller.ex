defmodule BedrockAppWeb.PageController do
  use BedrockAppWeb, :controller

  def home(conn, _params) do
    render(conn, :home)
  end
end
